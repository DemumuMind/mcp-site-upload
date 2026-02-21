import type { SupabaseClient } from "@supabase/supabase-js";
import { withRetry } from "@/lib/api/fetch-with-retry";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { AuthType, ServerStatus, VerificationLevel } from "@/lib/types";
import { getGithubReadme } from "@/lib/github-server-details";

export type CatalogSyncFailure = {
  slug: string;
  reason: string;
};

export type CatalogSyncModerationFilterHit = {
  slug: string;
  reason: string;
};

export type CatalogSyncQualityFilterHit = {
  slug: string;
  score: number;
  reason: string;
};

export type CatalogSyncResult = {
  executedAt: string;
  registryUrl: string;
  pageLimit: number;
  maxPages: number;
  fetchedPages: number;
  fetchedRecords: number;
  candidates: number;
  queuedForUpsert: number;
  created: number;
  updated: number;
  moderationRulesEnabled: boolean;
  allowlistPatternCount: number;
  denylistPatternCount: number;
  allowlisted: number;
  moderationFiltered: number;
  moderationFilteredSamples: CatalogSyncModerationFilterHit[];
  qualityFilterEnabled: boolean;
  qualityFiltered: number;
  qualityFilteredSamples: CatalogSyncQualityFilterHit[];
  skippedManual: number;
  skippedInvalid: number;
  failed: number;
  failures: CatalogSyncFailure[];
  changedSlugs: string[];
  staleCleanupEnabled: boolean;
  staleCleanupApplied: boolean;
  staleCleanupReason: string | null;
  minStaleBaselineRatio: number;
  maxStaleMarkRatio: number;
  staleBaselineCount: number;
  staleCoverageRatio: number | null;
  staleCandidates: number;
  staleCappedCount: number;
  staleGraceMarked: number;
  staleRejectedAfterGrace: number;
  staleMarked: number;
  staleFailed: number;
};

const DEFAULT_MAX_PAGES = 10;
const DEFAULT_PER_PAGE = 100;
const AUTO_STATUS: ServerStatus = "active";
const AUTO_VERIFICATION_LEVEL: VerificationLevel = "community";
const AUTO_MANAGED_TAG = "registry-auto";
const SOURCE_TAG = "github-sync";
const STALE_MARK_TAG = "registry-stale";
const STALE_CANDIDATE_TAG = "registry-stale-candidate";

type GitHubOwner = {
  login?: string;
  html_url?: string;
};

type GitHubRepository = {
  full_name?: string;
  name?: string;
  description?: string | null;
  html_url?: string;
  homepage?: string | null;
  topics?: string[];
  archived?: boolean;
  owner?: GitHubOwner;
};

type GitHubSearchResponse = {
  items?: GitHubRepository[];
};

type ExistingServerRow = {
  slug: string;
  tags: string[] | null;
};

type SyncRowPayload = {
  name: string;
  slug: string;
  description: string;
  server_url: string | null;
  category: string;
  auth_type: AuthType;
  tags: string[];
  repo_url: string | null;
  maintainer: {
    name: string;
    email?: string;
  };
  status: ServerStatus;
  verification_level: VerificationLevel;
  tools: string[];
};

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

function normalizeTag(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
}

function toAuthType(source: string): AuthType {
  const normalized = source.toLowerCase();
  if (normalized.includes("oauth")) return "oauth";
  if (
    normalized.includes("api key") ||
    normalized.includes("apikey") ||
    normalized.includes("token") ||
    normalized.includes("secret") ||
    normalized.includes("bearer")
  ) {
    return "api_key";
  }
  return "none";
}

function inferCategory(source: string): string {
  const s = source.toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(s)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(s)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(s)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(s)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(s)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(s)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

async function buildPayload(repo: GitHubRepository): Promise<SyncRowPayload | null> {
  if (repo.archived) return null;
  const fullName = normalizeWhitespace(repo.full_name ?? "");
  const repoName = normalizeWhitespace(repo.name ?? "");
  const description = normalizeWhitespace(repo.description ?? "");
  const repoUrl = normalizeWhitespace(repo.html_url ?? "");
  if (!fullName || !repoName || !repoUrl) return null;

  const canonicalName = repoName
    .replace(/^mcp[-_]/i, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  const displayName = canonicalName
    .split(" ")
    .filter(Boolean)
    .map((chunk) => chunk.charAt(0).toUpperCase() + chunk.slice(1))
    .join(" ")
    .slice(0, 120);
  const slug = normalizeSlug(repoName);
  const sourceText = `${fullName} ${displayName} ${description} ${(repo.topics ?? []).join(" ")}`;

  const tags = new Set<string>([AUTO_MANAGED_TAG, SOURCE_TAG, "mcp", "github"]);
  for (const topic of repo.topics ?? []) {
    const normalized = normalizeTag(topic);
    if (normalized) tags.add(normalized);
  }

  // Fetch README and extract tools
  const readmeData = await getGithubReadme(repoUrl);
  const tools = readmeData?.tools || [];

  return {
    name: displayName || repoName,
    slug,
    description: (description || `Imported from GitHub repository ${fullName}.`).slice(0, 800),
    server_url: normalizeWhitespace(repo.homepage ?? "") || repoUrl,
    category: inferCategory(sourceText),
    auth_type: toAuthType(sourceText),
    tags: [...tags].slice(0, 12),
    repo_url: repoUrl,
    maintainer: {
      name: normalizeWhitespace(repo.owner?.login ?? "GitHub"),
    },
    status: AUTO_STATUS,
    verification_level: AUTO_VERIFICATION_LEVEL,
    tools,
  };
}

function chunkArray<T>(values: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let index = 0; index < values.length; index += chunkSize) {
    chunks.push(values.slice(index, index + chunkSize));
  }
  return chunks;
}

async function fetchGithubRepos(maxPages: number, token: string | null): Promise<GitHubRepository[]> {
  const uniqueByFullName = new Map<string, GitHubRepository>();
  const query = encodeURIComponent("topic:mcp-server archived:false");

  for (let page = 1; page <= maxPages; page += 1) {
    const currentPage = page;
    let response: Response;
    try {
      response = await withRetry(
        () =>
          fetch(
            `https://api.github.com/search/repositories?q=${query}&sort=updated&order=desc&per_page=${DEFAULT_PER_PAGE}&page=${currentPage}`,
            {
              headers: {
                Accept: "application/vnd.github+json",
                ...(token ? { Authorization: `Bearer ${token}` } : {}),
              },
              cache: "no-store",
            },
          ),
        { maxRetries: 2, baseDelayMs: 1000 },
      );
    } catch (error) {
      const cause = error instanceof Error && "cause" in error ? (error as { cause?: unknown }).cause : undefined;
      const causeObject = (cause && typeof cause === "object") ? (cause as Record<string, unknown>) : undefined;
      const causeCode = typeof causeObject?.code === "string" ? causeObject.code : "unknown";
      const causeMessage = cause instanceof Error
        ? cause.message
        : typeof causeObject?.message === "string"
          ? causeObject.message
          : error instanceof Error
            ? error.message
            : "fetch failed";

      throw new Error(
        `GitHub fetch failed on page=${currentPage}: ${causeMessage} (code=${causeCode})`,
        { cause: error },
      );
    }

    if (!response.ok) {
      throw new Error(`GitHub search failed (${response.status})`);
    }

    const payload = (await response.json()) as GitHubSearchResponse;
    const items = payload.items ?? [];
    for (const item of items) {
      const fullName = normalizeWhitespace(item.full_name ?? "");
      if (!fullName) continue;
      uniqueByFullName.set(fullName.toLowerCase(), item);
    }
    if (items.length < DEFAULT_PER_PAGE) break;
  }

  return [...uniqueByFullName.values()];
}

function createResult(maxPages: number): CatalogSyncResult {
  return {
    executedAt: new Date().toISOString(),
    registryUrl: "github://search/topic:mcp-server",
    pageLimit: DEFAULT_PER_PAGE,
    maxPages,
    fetchedPages: 0,
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
    staleCleanupEnabled: true,
    staleCleanupApplied: false,
    staleCleanupReason: null,
    minStaleBaselineRatio: 0,
    maxStaleMarkRatio: 1,
    staleBaselineCount: 0,
    staleCoverageRatio: null,
    staleCandidates: 0,
    staleCappedCount: 0,
    staleGraceMarked: 0,
    staleRejectedAfterGrace: 0,
    staleMarked: 0,
    staleFailed: 0,
  };
}

function hasTag(tags: string[] | null, expected: string): boolean {
  return (tags ?? []).some((tag) => normalizeTag(tag) === expected);
}

function addChangedSlug(result: CatalogSyncResult, slug: string): void {
  if (!result.changedSlugs.includes(slug)) result.changedSlugs.push(slug);
}

async function fetchExistingRows(adminClient: SupabaseClient, slugs: string[]): Promise<Map<string, ExistingServerRow>> {
  const map = new Map<string, ExistingServerRow>();
  for (const chunk of chunkArray(slugs, 250)) {
    const { data, error } = await adminClient.from("servers").select("slug, tags").in("slug", chunk);
    if (error) throw new Error(`Failed to read existing servers: ${error.message}`);
    for (const row of (data ?? []) as ExistingServerRow[]) map.set(row.slug, row);
  }
  return map;
}

async function fetchAutoManagedRows(adminClient: SupabaseClient): Promise<ExistingServerRow[]> {
  const { data, error } = await adminClient
    .from("servers")
    .select("slug, tags")
    .eq("status", "active")
    .contains("tags", [AUTO_MANAGED_TAG]);
  if (error) throw new Error(`Failed to fetch auto-managed rows: ${error.message}`);
  return (data ?? []) as ExistingServerRow[];
}

function buildGraceCandidateTags(tags: string[] | null): string[] {
  const normalized = new Set<string>();
  for (const tag of tags ?? []) {
    const safeTag = normalizeTag(tag);
    if (safeTag && safeTag !== STALE_MARK_TAG) normalized.add(safeTag);
  }
  normalized.add(AUTO_MANAGED_TAG);
  normalized.add(STALE_CANDIDATE_TAG);
  return [...normalized].slice(0, 12);
}

function buildRejectedStaleTags(tags: string[] | null): string[] {
  const normalized = new Set<string>();
  for (const tag of tags ?? []) {
    const safeTag = normalizeTag(tag);
    if (safeTag && safeTag !== STALE_CANDIDATE_TAG) normalized.add(safeTag);
  }
  normalized.add(AUTO_MANAGED_TAG);
  normalized.add(STALE_MARK_TAG);
  return [...normalized].slice(0, 12);
}

export async function runCatalogGithubSync(options: { maxPages?: number } = {}): Promise<CatalogSyncResult> {
  const maxPages = Number.isFinite(options.maxPages) ? Math.max(1, Math.min(Math.round(options.maxPages ?? DEFAULT_MAX_PAGES), 30)) : DEFAULT_MAX_PAGES;
  const result = createResult(maxPages);
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    throw new Error("Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
  }

  const githubToken = process.env.GH_API_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim() || null;
  const repos = await fetchGithubRepos(maxPages, githubToken);
  result.fetchedPages = Math.ceil(repos.length / DEFAULT_PER_PAGE);
  result.fetchedRecords = repos.length;

  const payloadBySlug = new Map<string, SyncRowPayload>();
  for (const repo of repos) {
    const payload = await buildPayload(repo);
    if (!payload) {
      result.skippedInvalid += 1;
      continue;
    }
    if (!payloadBySlug.has(payload.slug)) {
      payloadBySlug.set(payload.slug, payload);
    }
  }
  const payloads = [...payloadBySlug.values()];

  result.candidates = payloads.length;
  const existingBySlug = await fetchExistingRows(adminClient, payloads.map((p) => p.slug));
  const upsertQueue: SyncRowPayload[] = [];

  for (const payload of payloads) {
    const existing = existingBySlug.get(payload.slug);
    if (existing && !hasTag(existing.tags, AUTO_MANAGED_TAG)) {
      result.skippedManual += 1;
      continue;
    }
    upsertQueue.push(payload);
  }

  result.queuedForUpsert = upsertQueue.length;

  for (const chunk of chunkArray(upsertQueue, 50)) {
    const { error } = await adminClient.from("servers").upsert(chunk, {
      onConflict: "slug",
      ignoreDuplicates: false,
    });
    if (error) {
      for (const row of chunk) {
        result.failed += 1;
        result.failures.push({ slug: row.slug, reason: error.message });
      }
      continue;
    }
    for (const row of chunk) {
      if (existingBySlug.has(row.slug)) result.updated += 1;
      else result.created += 1;
      addChangedSlug(result, row.slug);
    }
  }

  const activeAutoManagedRows = await fetchAutoManagedRows(adminClient);
  result.staleBaselineCount = activeAutoManagedRows.length;
  result.staleCleanupApplied = true;
  const fetchedSlugSet = new Set(payloads.map((p) => p.slug));
  const staleRows = activeAutoManagedRows.filter((row) => !fetchedSlugSet.has(row.slug));
  result.staleCandidates = staleRows.length;

  for (const row of staleRows) {
    const shouldReject = hasTag(row.tags, STALE_CANDIDATE_TAG);
    const { error } = await adminClient
      .from("servers")
      .update(
        shouldReject
          ? { status: "rejected", tags: buildRejectedStaleTags(row.tags) }
          : { tags: buildGraceCandidateTags(row.tags) },
      )
      .eq("slug", row.slug);
    if (error) {
      result.staleFailed += 1;
      result.failed += 1;
      result.failures.push({ slug: row.slug, reason: `stale_cleanup: ${error.message}` });
      continue;
    }
    if (shouldReject) {
      result.staleRejectedAfterGrace += 1;
      result.staleMarked += 1;
    } else {
      result.staleGraceMarked += 1;
    }
    addChangedSlug(result, row.slug);
  }
  result.staleCleanupReason = "GitHub source sync completed.";
  return result;
}
