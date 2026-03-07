import {
  normalizeCanonicalName,
  normalizePackageName,
  normalizeRepositoryUrl,
  normalizeTag,
  normalizeUrl,
  normalizeUrlForIdentity,
  slugify,
  uniqueValues,
} from "../core/normalize.ts";
import type { CatalogProvider, CatalogProviderSeed, NormalizedCandidate } from "../core/types.ts";

type PypiInfo = {
  name?: string;
  summary?: string;
  description?: string;
  home_page?: string;
  project_urls?: Record<string, string> | null;
  author?: string;
  version?: string;
};

type PypiPayload = {
  info?: PypiInfo;
};

export function buildPypiSeedSet(seeds: CatalogProviderSeed[]): string[] {
  return seeds.flatMap((seed) => {
    const values: string[] = [];
    if (seed.packageName) {
      values.push(normalizePackageName(seed.packageName) ?? "");
    }
    if (seed.repoHint) {
      try {
        const parsed = new URL(seed.repoHint);
        const lastSegment = parsed.pathname.split("/").filter(Boolean).at(-1);
        if (lastSegment) {
          values.push(lastSegment.toLowerCase().replace(/_/g, "-"));
        }
      } catch {
        // ignore invalid repo hints
      }
    }
    return values.filter(Boolean);
  });
}

export function normalizePypiProjectUrls(
  projectUrls: Record<string, string> | null | undefined,
  homePage?: string | null,
): {
  repoUrl: string | null;
  repoUrlNormalized: string | null;
  homepageUrl: string | null;
  documentationUrl: string | null;
} {
  const entries = Object.entries(projectUrls ?? {});
  const preferredRepo = entries.find(([key]) => /source|repo/i.test(key))?.[1] ?? null;
  const preferredHome = entries.find(([key]) => /home/i.test(key))?.[1] ?? homePage ?? null;
  const documentationUrl = entries.find(([key]) => /docs|documentation/i.test(key))?.[1] ?? null;
  const repo = normalizeRepositoryUrl(preferredRepo);

  return {
    repoUrl: repo.url,
    repoUrlNormalized: repo.normalized,
    homepageUrl: normalizeUrl(preferredHome),
    documentationUrl: normalizeUrl(documentationUrl),
  };
}

export function normalizePypiPackage(input: {
  packageName: string;
  payload: PypiPayload;
  repoHints?: string[];
  scopeKey: string;
}): NormalizedCandidate {
  const info = input.payload.info ?? {};
  const normalizedUrls = normalizePypiProjectUrls(info.project_urls ?? null, info.home_page ?? null);
  const repoHintMatches = uniqueValues(input.repoHints ?? []).some((hint) => {
    const normalizedHint = normalizeRepositoryUrl(hint).normalized;
    return Boolean(normalizedHint && normalizedHint === normalizedUrls.repoUrlNormalized);
  });
  const tags = ["mcp", "pypi", normalizeTag(info.name), normalizeTag("python")]
    .filter((value): value is string => Boolean(value));

  return {
    sourceType: "pypi",
    sourceNativeId: `pypi:${normalizePackageName(input.packageName)}`,
    scopeKey: input.scopeKey,
    name: info.name?.trim() || input.packageName,
    slug: slugify(info.name ?? input.packageName),
    description: (info.summary?.trim() || info.description?.trim() || `PyPI package ${input.packageName}`).slice(0, 800),
    serverUrl: normalizedUrls.homepageUrl,
    homepageUrl: normalizedUrls.homepageUrl,
    repoUrl: normalizedUrls.repoUrl,
    repoUrlNormalized: normalizedUrls.repoUrlNormalized,
    category: "Developer Tools",
    authType: "none",
    tags,
    maintainer: info.author ? { name: info.author } : null,
    identity: {
      canonicalName: normalizeCanonicalName(info.name ?? input.packageName),
      repoUrlNormalized: normalizedUrls.repoUrlNormalized,
      packageType: "pypi",
      packageName: normalizePackageName(info.name ?? input.packageName),
      packageVersion: info.version?.trim() || null,
      homepageUrlNormalized: normalizeUrlForIdentity(normalizedUrls.homepageUrl),
      serverUrlNormalized: normalizeUrlForIdentity(normalizedUrls.homepageUrl),
    },
    sourceMeta: {
      documentationUrl: normalizedUrls.documentationUrl,
      repoHintMatches,
    },
    verificationHints: {
      repoMatch: repoHintMatches,
      packageExists: true,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: Boolean(info.description?.trim()),
      docsPresent: Boolean(normalizedUrls.documentationUrl || normalizedUrls.homepageUrl),
      healthStatus: "unknown",
      riskyFlags: [],
    },
  };
}

export function createPypiProvider(seeds: CatalogProviderSeed[] = []): CatalogProvider {
  return {
  sourceType: "pypi",
  supportsFullSweep: false,
  supportsConditionalFetch: true,
  buildScopeKey: (input) => `pypi:${normalizePackageName(input?.seed ?? input?.sourceScope ?? "default") ?? "default"}`,
  fetch: async ({ seeds: providerSeeds = seeds, scopeKey, state, fetchImpl = fetch }) => {
    const packageNames = [...new Set(buildPypiSeedSet(providerSeeds))];
    const rawCandidates = [];

    for (const packageName of packageNames) {
      const response = await fetchImpl(`https://pypi.org/pypi/${packageName}/json`, {
        headers: {
          Accept: "application/json",
          ...(state?.etag ? { "If-None-Match": state.etag } : {}),
          ...(state?.lastModified ? { "If-Modified-Since": state.lastModified } : {}),
        },
      });

      if (response.status === 304) {
        continue;
      }
      if (!response.ok) {
        continue;
      }

      rawCandidates.push({
        sourceNativeId: `pypi:${packageName}`,
        payload: await response.json(),
        summary: { packageName },
      });
    }

    return {
      scopeKey,
      rawCandidates,
      fullSweepCompleted: true,
      fetchMetadata: {
        httpStatus: rawCandidates.length > 0 ? 200 : 204,
        notModified: rawCandidates.length === 0 && packageNames.length > 0,
        itemCount: rawCandidates.length,
      },
    };
  },
  normalize: async ({ rawCandidate, scopeKey, seeds: providerSeeds = seeds }) => [
    normalizePypiPackage({
      packageName: rawCandidate.sourceNativeId.replace(/^pypi:/, ""),
      payload: rawCandidate.payload as PypiPayload,
      repoHints: providerSeeds.map((seed) => seed.repoHint ?? "").filter(Boolean),
      scopeKey,
    }),
  ],
  };
}

export const pypiProvider = createPypiProvider();
