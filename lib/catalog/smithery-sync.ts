import { z } from "zod";
import { withRetry } from "@/lib/api/fetch-with-retry";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthType, ServerStatus, VerificationLevel } from "@/lib/types";
import { CatalogSyncResult } from "./github-sync";

// Схема ответа Smithery API
const SmitherServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  owner: z.string().optional(),
  repoUrl: z.string().url().optional(),
  homepage: z.string().url().optional(),
  tags: z.array(z.string()).optional().default([]),
  readme: z.string().optional(),
});

const SmitheryApiResponseSchema = z.object({
  servers: z.array(SmitherServerSchema),
});

type SmitheryServer = z.infer<typeof SmitherServerSchema>;

const AUTO_STATUS: ServerStatus = "active";
const AUTO_VERIFICATION_LEVEL: VerificationLevel = "community";
const SOURCE_TAG = "smithery-sync";
const AUTO_MANAGED_TAG = "registry-auto";

function normalizeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function inferCategory(description: string, tags: string[]): string {
  const content = (description + " " + tags.join(" ")).toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(content)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(content)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(content)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(content)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(content)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(content)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

function mapSmitheryToPayload(server: SmitheryServer) {
  const slug = normalizeSlug(server.name);
  const tags = new Set([AUTO_MANAGED_TAG, SOURCE_TAG, "mcp", "smithery", ...server.tags]);

  return {
    name: server.name,
    slug,
    description: server.description.slice(0, 800) || `MCP server from Smithery registry: ${server.name}`,
    server_url: server.homepage || server.repoUrl || "",
    category: inferCategory(server.description, server.tags),
    auth_type: "none" as AuthType, // Smithery обычно не указывает auth тип явно в списке
    tags: Array.from(tags).slice(0, 12),
    repo_url: server.repoUrl || null,
    maintainer: {
      name: server.owner || "Smithery Community",
    },
    status: AUTO_STATUS,
    verification_level: AUTO_VERIFICATION_LEVEL,
  };
}

export async function runCatalogSmitherySync(): Promise<CatalogSyncResult> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) throw new Error("Supabase admin credentials not configured");

  const result: CatalogSyncResult = {
    executedAt: new Date().toISOString(),
    registryUrl: "https://api.smithery.ai/servers",
    pageLimit: 0,
    maxPages: 1,
    fetchedPages: 1,
    fetchedRecords: 0,
    candidates: 0,
    queuedForUpsert: 0,
    created: 0,
    updated: 0,
    moderationRulesEnabled: false,
    allowlistPatternCount: 0,
    denylistPatternCount: 0,
    allowlisted: 0,
    moderationFiltered: 0,
    moderationFilteredSamples: [],
    qualityFilterEnabled: false,
    qualityFiltered: 0,
    qualityFilteredSamples: [],
    skippedManual: 0,
    skippedInvalid: 0,
    failed: 0,
    failures: [],
    changedSlugs: [],
    staleCleanupEnabled: false,
    staleCleanupApplied: false,
    staleCleanupReason: null,
    minStaleBaselineRatio: 0,
    maxStaleMarkRatio: 0,
    staleBaselineCount: 0,
    staleCoverageRatio: null,
    staleCandidates: 0,
    staleCappedCount: 0,
    staleGraceMarked: 0,
    staleRejectedAfterGrace: 0,
    staleMarked: 0,
    staleFailed: 0,
  };

  try {
    const response = await withRetry(() =>
      fetch("https://api.smithery.ai/servers", {
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${process.env.SMITHERY_API_KEY || ""}`
        }
      })
    );

    if (!response.ok) throw new Error(`Smithery API error: ${response.status}`);

    const data = await response.json();
    const validated = SmitheryApiResponseSchema.parse(data);

    result.fetchedRecords = validated.servers.length;
    const payloads = validated.servers.map(mapSmitheryToPayload);
    result.candidates = payloads.length;
    result.queuedForUpsert = payloads.length;

    // 1. Дедупликация по repo_url
    const { data: existingServers } = await adminClient
      .from("servers")
      .select("slug, repo_url, tags")
      .not("repo_url", "is", null);

    const repoUrlToSlug = new Map(existingServers?.map(s => [s.repo_url?.toLowerCase(), s.slug]) || []);

    // Переназначаем слаги для тех, у кого совпадает repo_url
    payloads.forEach(p => {
      const existingSlug = repoUrlToSlug.get(p.repo_url?.toLowerCase());
      if (existingSlug && existingSlug !== p.slug) {
        p.slug = existingSlug;
      }
    });

    // Массовая вставка/обновление
    for (const chunk of chunkArray(payloads, 50)) {
      const { error, data: upsertData } = await adminClient
        .from("servers")
        .upsert(chunk, { onConflict: "slug" })
        .select("slug");

      if (error) {
        result.failed += chunk.length;
        result.failures.push(...chunk.map(c => ({ slug: c.slug, reason: error.message })));
        continue;
      }

      result.updated += (upsertData?.length || 0);
      upsertData?.forEach(row => {
        if (!result.changedSlugs.includes(row.slug)) {
          result.changedSlugs.push(row.slug);
        }
      });
    }

  } catch (error) {
    result.failed = 1;
    result.failures.push({ slug: "global", reason: error instanceof Error ? error.message : "Unknown error" });
  }

  return result;
}

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < values.length; i += chunkSize) {
    chunks.push(values.slice(i, i + chunkSize));
  }
  return chunks;
}
