import { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { withRetry } from "@/lib/api/fetch-with-retry";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthType, ServerStatus, VerificationLevel } from "@/lib/types";
import { CatalogSyncResult } from "./github-sync";

// Схема ответа NPM Search API
const NpmPackageSchema = z.object({
  package: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional().default(""),
    keywords: z.array(z.string()).optional().default([]),
    date: z.string(),
    links: z.object({
      npm: z.string(),
      repository: z.string().optional(),
      homepage: z.string().optional(),
    }),
    publisher: z.object({
      username: z.string(),
    }).optional(),
    maintainers: z.array(z.object({
      username: z.string(),
    })).optional().default([]),
  }),
  score: z.object({
    final: z.number(),
    detail: z.object({
      quality: z.number(),
      popularity: z.number(),
      maintenance: z.number(),
    }),
  }),
});

const NpmSearchResponseSchema = z.object({
  objects: z.array(NpmPackageSchema),
  total: z.number(),
});

type NpmPackage = z.infer<typeof NpmPackageSchema>;

const AUTO_STATUS: ServerStatus = "active";
const AUTO_VERIFICATION_LEVEL: VerificationLevel = "community";
const SOURCE_TAG = "npm-sync";
const AUTO_MANAGED_TAG = "registry-auto";

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function normalizeSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 90);
}

function inferCategory(description: string, keywords: string[]): string {
  const content = (description + " " + keywords.join(" ")).toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(content)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(content)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(content)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(content)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(content)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(content)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

function mapNpmToPayload(item: NpmPackage) {
  const pkg = item.package;
  const slug = normalizeSlug(pkg.name.replace(/^@/, "").replace(/\//, "-"));

  const tags = new Set([
    AUTO_MANAGED_TAG,
    SOURCE_TAG,
    "mcp",
    "npm",
    ...(pkg.keywords || [])
  ]);

  const description = normalizeWhitespace(pkg.description || `MCP server published on NPM as ${pkg.name}`);

  return {
    name: pkg.name,
    slug,
    description: description.slice(0, 800),
    server_url: pkg.links.homepage || pkg.links.npm,
    category: inferCategory(description, pkg.keywords),
    auth_type: "none" as AuthType,
    tags: Array.from(tags).slice(0, 12).map(t => t.toLowerCase().replace(/[^a-z0-9-]+/g, "-")),
    repo_url: pkg.links.repository || null,
    maintainer: {
      name: pkg.publisher?.username || pkg.maintainers[0]?.username || "NPM User",
    },
    status: AUTO_STATUS,
    verification_level: AUTO_VERIFICATION_LEVEL,
  };
}

export async function runCatalogNpmSync(): Promise<CatalogSyncResult> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) throw new Error("Supabase admin credentials not configured");

  const result: CatalogSyncResult = {
    executedAt: new Date().toISOString(),
    registryUrl: "https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server",
    pageLimit: 250,
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
    // Поиск пакетов с ключевым словом mcp-server
    const response = await withRetry(() =>
      fetch("https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server&size=250", {
        headers: { "Accept": "application/json" }
      })
    );

    if (!response.ok) throw new Error(`NPM Registry error: ${response.status}`);

    const data = await response.json();
    const validated = NpmSearchResponseSchema.parse(data);

    result.fetchedRecords = validated.objects.length;
    const payloads = validated.objects.map(mapNpmToPayload);
    result.candidates = payloads.length;
    result.queuedForUpsert = payloads.length;

    // 1. Дедупликация по repo_url
    const { data: allActiveServers } = await adminClient
      .from("servers")
      .select("slug, repo_url")
      .not("repo_url", "is", null);

    const repoUrlToSlug = new Map(allActiveServers?.map(s => [s.repo_url?.toLowerCase(), s.slug]) || []);

    // Переназначаем слаги для тех, у кого совпадает repo_url
    payloads.forEach(p => {
      const existingSlug = repoUrlToSlug.get(p.repo_url?.toLowerCase());
      if (existingSlug && existingSlug !== p.slug) {
        p.slug = existingSlug;
      }
    });

    // Получаем текущие слаги для разделения created/updated
    const { data: existingServers } = await adminClient
      .from("servers")
      .select("slug")
      .in("slug", payloads.map(p => p.slug));

    const existingSlugs = new Set(existingServers?.map(s => s.slug) || []);

    // Массовая вставка
    for (const chunk of chunkArray(payloads, 50)) {
      const { error } = await adminClient
        .from("servers")
        .upsert(chunk, { onConflict: "slug" });

      if (error) {
        result.failed += chunk.length;
        result.failures.push(...chunk.map(c => ({ slug: c.slug, reason: error.message })));
        continue;
      }

      chunk.forEach(row => {
        if (existingSlugs.has(row.slug)) result.updated += 1;
        else result.created += 1;

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
