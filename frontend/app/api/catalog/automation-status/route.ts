import { promises as fs } from "node:fs";
import path from "node:path";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { executeCatalogAutomationStatus } from "@/lib/catalog/automation-status-core";
import { getActiveCatalogSyncLocks, getRecentCatalogSyncRuns } from "@/lib/catalog/sync-run-store";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type CronConfig = {
  path?: string;
  schedule?: string;
};

type VercelConfig = {
  crons?: CronConfig[];
};

async function readCatalogCronSchedules(): Promise<string[]> {
  try {
    const vercelConfigPath = path.join(process.cwd(), "vercel.json");
    const raw = await fs.readFile(vercelConfigPath, "utf8");
    const parsed = JSON.parse(raw) as VercelConfig;
    return (parsed.crons ?? [])
      .filter(
        (job) =>
          (job.path === "/api/catalog/sync-all" || job.path === "/api/catalog/auto-sync") &&
          typeof job.schedule === "string",
      )
      .map((job) => job.schedule as string);
  } catch {
    return [];
  }
}

function hasCatalogSecret(): boolean {
  return Boolean(process.env.CATALOG_AUTOSYNC_CRON_SECRET || process.env.CRON_SECRET);
}

const handlers = withCronAuth(
  async (_request, { logger }) => {
    const response = await executeCatalogAutomationStatus({
      readCronSchedules: readCatalogCronSchedules,
      hasCatalogSecret,
      readCatalogData: async () => {
        const supabaseAdminClient = createSupabaseAdminClient();
        const supabaseConfigured = Boolean(supabaseAdminClient);

        let autoManagedActiveCount: number | null = null;
        let lastAutoManagedCreatedAt: string | null = null;
        let dataCheckError: string | null = null;

        if (supabaseAdminClient) {
          const [{ count, error: countError }, { data, error: latestError }] = await Promise.all([
            supabaseAdminClient
              .from("servers")
              .select("id", { count: "exact", head: true })
              .eq("status", "active")
              .contains("tags", ["registry-auto"]),
            supabaseAdminClient
              .from("servers")
              .select("created_at")
              .eq("status", "active")
              .contains("tags", ["registry-auto"])
              .order("created_at", { ascending: false })
              .limit(1)
              .maybeSingle(),
          ]);

          if (countError) {
            dataCheckError = countError.message;
          } else {
            autoManagedActiveCount = count ?? 0;
          }

          if (!dataCheckError && latestError) {
            dataCheckError = latestError.message;
          } else {
            lastAutoManagedCreatedAt = (data?.created_at as string | undefined) ?? null;
          }
        }

        return {
          supabaseConfigured,
          autoManagedActiveCount,
          lastAutoManagedCreatedAt,
          dataCheckError,
        };
      },
      readRecentRuns: async () => getRecentCatalogSyncRuns(10, { logger }),
      readActiveLocks: async () => getActiveCatalogSyncLocks({ logger }),
    });

    return NextResponse.json(response);
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog_automation_status",
);

export const GET = handlers.GET;
