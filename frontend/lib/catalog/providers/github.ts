import { withRetry } from "../../api/fetch-with-retry.ts";
import { withRequestCachePolicy } from "../../cache/policy.ts";
import { getGithubReadme } from "../../github-server-details.ts";
import type { AuthType } from "../../types";
import {
  normalizeCanonicalName,
  normalizeRepositoryUrl,
  normalizeTag,
  normalizeUrlForIdentity,
  slugify,
} from "../core/normalize.ts";
import type { CatalogProvider, NormalizedCandidate, ProviderRawCandidate } from "../core/types.ts";

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

type GitHubProviderOptions = {
  maxPages?: number;
  pageLimit?: number;
  discoveryEnabled?: boolean;
  baselinePublishedSlugs?: string[];
  minStaleBaselineRatio?: number;
  maxStaleMarkRatio?: number;
  readmeFetchLimit?: number;
  readmeFetcher?: typeof getGithubReadme;
  seeds?: Array<{ repoHint?: string | null; packageName?: string | null; rawText?: string | null }>;
};

function inferAuthType(source: string): AuthType {
  const normalized = source.toLowerCase();
  if (normalized.includes("oauth")) {
    return "oauth";
  }
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
  const normalized = source.toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(normalized)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(normalized)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(normalized)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(normalized)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(normalized)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(normalized)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

function getRiskyFlags(repo: GitHubRepository): string[] {
  const value = `${repo.full_name ?? ""} ${repo.name ?? ""} ${repo.description ?? ""}`.toLowerCase();
  const flags: string[] = [];
  if (repo.archived) {
    flags.push("archived");
  }
  if (/\b(test|demo|staging|template)\b/.test(value)) {
    flags.push("staging_or_test");
  }
  return flags;
}

function previewSlug(repo: GitHubRepository): string {
  return slugify(repo.name ?? repo.full_name ?? "github-server");
}

async function normalizeGitHubRepository(
  repo: GitHubRepository,
  scopeKey: string,
  readmeFetcher: typeof getGithubReadme,
  canFetchReadme: () => boolean,
): Promise<NormalizedCandidate | null> {
  if (repo.archived) {
    return null;
  }

  const repoUrl = repo.html_url?.trim() ?? "";
  const repoIdentity = normalizeRepositoryUrl(repoUrl);
  if (!repoUrl || !repoIdentity.normalized) {
    return null;
  }

  const readme = canFetchReadme() ? await readmeFetcher(repoUrl) : null;
  const topics = (repo.topics ?? [])
    .map((topic) => normalizeTag(topic))
    .filter((value): value is string => Boolean(value));
  const tags = [...new Set(["mcp", "github", "github-sync", ...topics])];
  const sourceText = `${repo.full_name ?? ""} ${repo.name ?? ""} ${repo.description ?? ""} ${topics.join(" ")}`;
  const displayName =
    repo.name
      ?.replace(/^mcp[-_]/i, "")
      .replace(/[-_]/g, " ")
      .trim() || repo.name || repo.full_name || "GitHub MCP";

  return {
    sourceType: "github",
    sourceNativeId: `github:${(repo.full_name ?? repo.name ?? "").toLowerCase()}`,
    scopeKey,
    name: displayName,
    slug: previewSlug(repo),
    description: (repo.description?.trim() || `Imported from GitHub repository ${repo.full_name ?? repo.name ?? ""}.`).slice(0, 800),
    serverUrl: repo.homepage?.trim() || repoUrl,
    homepageUrl: repo.homepage?.trim() || repoUrl,
    repoUrl: repoIdentity.url,
    repoUrlNormalized: repoIdentity.normalized,
    category: inferCategory(sourceText),
    authType: inferAuthType(sourceText),
    tags,
    maintainer: {
      name: repo.owner?.login?.trim() || "GitHub",
    },
    identity: {
      canonicalName: normalizeCanonicalName(displayName),
      repoUrlNormalized: repoIdentity.normalized,
      packageType: null,
      packageName: null,
      packageVersion: null,
      homepageUrlNormalized: normalizeUrlForIdentity(repo.homepage?.trim() || null),
      serverUrlNormalized: normalizeUrlForIdentity(repo.homepage?.trim() || repoUrl),
    },
    sourceMeta: {
      fullName: repo.full_name ?? null,
      topics,
      readmeTools: readme?.tools ?? [],
      ownerUrl: repo.owner?.html_url ?? null,
    },
    verificationHints: {
      repoMatch: true,
      packageExists: false,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: Boolean(readme?.content?.trim()),
      docsPresent: Boolean(repo.homepage?.trim()),
      healthStatus: "unknown",
      riskyFlags: getRiskyFlags(repo),
    },
  };
}

export function createGitHubCatalogProvider(options: GitHubProviderOptions = {}): CatalogProvider {
  const maxPages = Math.max(1, Math.min(options.maxPages ?? 5, 30));
  const pageLimit = Math.max(1, Math.min(options.pageLimit ?? 100, 100));
  const discoveryEnabled = options.discoveryEnabled ?? true;
  const baselinePublishedSlugs = new Set(options.baselinePublishedSlugs ?? []);
  const minStaleBaselineRatio = Math.max(0, Math.min(options.minStaleBaselineRatio ?? 0.7, 1));
  const maxStaleMarkRatio = Math.max(0.01, Math.min(options.maxStaleMarkRatio ?? 0.15, 1));
  const readmeFetcher = options.readmeFetcher ?? getGithubReadme;
  let remainingReadmeFetches = Math.max(0, options.readmeFetchLimit ?? 40);

  return {
    sourceType: "github",
    supportsFullSweep: true,
    supportsConditionalFetch: false,
    buildScopeKey: () => `github:topic:mcp-server:maxPages=${maxPages}`,
    fetch: async ({ scopeKey, fetchImpl = fetch, seeds = options.seeds ?? [] }) => {
      const token = process.env.GH_API_TOKEN?.trim() || process.env.GITHUB_TOKEN?.trim() || null;
      const uniqueByFullName = new Map<string, GitHubRepository>();
      const query = encodeURIComponent("topic:mcp-server archived:false");
      let fullSweepCompleted = false;

      if (discoveryEnabled) {
        for (let page = 1; page <= maxPages; page += 1) {
          const response = await withRetry(
            () =>
              fetchImpl(
                `https://api.github.com/search/repositories?q=${query}&sort=updated&order=desc&per_page=${pageLimit}&page=${page}`,
                withRequestCachePolicy("providerSearch", {
                  headers: {
                    Accept: "application/vnd.github+json",
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                  },
                }),
              ),
            { maxRetries: 2, baseDelayMs: 1000 },
          );

          if (!response.ok) {
            throw new Error(`GitHub search failed (${response.status})`);
          }

          const payload = (await response.json()) as GitHubSearchResponse;
          const items = payload.items ?? [];
          for (const item of items) {
            const fullName = (item.full_name ?? item.name ?? "").trim().toLowerCase();
            if (fullName) {
              uniqueByFullName.set(fullName, item);
            }
          }
          if (items.length < pageLimit) {
            fullSweepCompleted = true;
            break;
          }
        }
      }

      const repoHintSeeds = [...new Set(seeds.map((seed) => seed.repoHint ?? "").filter(Boolean))];
      for (const repoHint of repoHintSeeds) {
        const repo = normalizeRepositoryUrl(repoHint);
        if (!repo.normalized || !repo.normalized.startsWith("github.com/")) {
          continue;
        }
        const repoPath = repo.normalized.replace(/^github\.com\//, "");
        const response = await withRetry(
          () =>
            fetchImpl(
              `https://api.github.com/repos/${repoPath}`,
              withRequestCachePolicy("providerSearch", {
                headers: {
                  Accept: "application/vnd.github+json",
                  ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
              }),
            ),
          { maxRetries: 2, baseDelayMs: 1000 },
        );
        if (!response.ok) {
          continue;
        }
        const repoPayload = (await response.json()) as GitHubRepository;
        const fullName = (repoPayload.full_name ?? repoPayload.name ?? "").trim().toLowerCase();
        if (fullName) {
          uniqueByFullName.set(fullName, repoPayload);
        }
      }

      const rawCandidates: ProviderRawCandidate[] = [...uniqueByFullName.values()].map((repo) => ({
        sourceNativeId: `github:${(repo.full_name ?? repo.name ?? "").toLowerCase()}`,
        payload: repo,
        summary: {
          slug: previewSlug(repo),
          fullName: repo.full_name ?? repo.name ?? null,
        },
      }));

      const fetchedSlugs = new Set([...uniqueByFullName.values()].map((repo) => previewSlug(repo)));
      const staleCandidates = [...baselinePublishedSlugs].filter((slug) => !fetchedSlugs.has(slug));
      const coverageRatio =
        baselinePublishedSlugs.size > 0 ? rawCandidates.length / baselinePublishedSlugs.size : 1;
      const staleCleanupAllowed =
        discoveryEnabled &&
        fullSweepCompleted &&
        (baselinePublishedSlugs.size === 0 || coverageRatio >= minStaleBaselineRatio);
      const maxStaleMarks =
        baselinePublishedSlugs.size > 0
          ? Math.max(1, Math.floor(baselinePublishedSlugs.size * maxStaleMarkRatio))
          : staleCandidates.length;
      const stalePublishedSlugs = staleCleanupAllowed
        ? staleCandidates.slice(0, maxStaleMarks)
        : [];

      return {
        scopeKey,
        rawCandidates,
        fullSweepCompleted,
        staleCleanupAllowed,
        staleCleanupReason: staleCleanupAllowed
          ? staleCandidates.length > stalePublishedSlugs.length
            ? "GitHub stale cleanup capped for this run."
            : "GitHub full sweep completed."
          : !discoveryEnabled
            ? "GitHub stale cleanup skipped because discovery sweep is disabled for targeted processing."
            : fullSweepCompleted
            ? "GitHub stale cleanup skipped because fetched coverage fell below the configured threshold."
            : "GitHub stale cleanup skipped because the search window did not exhaust all matching pages.",
        staleCandidateCount: staleCandidates.length,
        stalePublishedSlugs,
        fetchMetadata: {
          httpStatus: 200,
          notModified: false,
          itemCount: rawCandidates.length,
        },
      };
    },
    normalize: async ({ rawCandidate, scopeKey }) => {
      const candidate = await normalizeGitHubRepository(
        rawCandidate.payload as GitHubRepository,
        scopeKey,
        readmeFetcher,
        () => {
          if (remainingReadmeFetches <= 0) {
            return false;
          }
          remainingReadmeFetches -= 1;
          return true;
        },
      );
      return candidate ? [candidate] : [];
    },
  };
}
