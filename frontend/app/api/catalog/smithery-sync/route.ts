import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { executeCatalogSmitherySync } from "@/lib/catalog/smithery-sync-core";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";

export const dynamic = "force-dynamic";

const handlers = withCronAuth(
  async (_request, { logger }) => {
    const response = await executeCatalogSmitherySync({
      runSync: async () => {
        const result = await runCatalogSmitherySync();
        return {
          ok: result.failed === 0,
          ...result,
        };
      },
      onSuccess: async (result) => {
        revalidatePath("/");
        revalidatePath("/catalog");
        revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");

        for (const slug of result.changedSlugs.slice(0, 100)) {
          revalidatePath(`/server/${slug}`);
        }
      },
      logInfo: (event, details) => logger.info(event, details),
      logError: (event, details) => logger.error(event, details),
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.smithery_sync",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
