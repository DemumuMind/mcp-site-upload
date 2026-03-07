import { withRetry } from "../../api/fetch-with-retry.ts";
import { withRequestCachePolicy } from "../../cache/policy.ts";
import {
  normalizeCanonicalName,
  normalizePackageName,
  normalizeRepositoryUrl,
  normalizeTag,
  normalizeUrl,
  normalizeUrlForIdentity,
  slugify,
} from "../core/normalize.ts";
import type { CatalogProvider, CatalogProviderSeed, NormalizedCandidate } from "../core/types.ts";

type RegistryPayload = {
  name?: string;
  title?: string;
  description?: string;
  repository?: {
    url?: string;
    source?: string;
  };
  packages?: Array<{
    registryType?: string;
    identifier?: string;
    version?: string;
  }>;
  websiteUrl?: string;
  _meta?: Record<string, unknown>;
};

function extractRegistryServers(payload: unknown): RegistryPayload[] {
  if (Array.isArray(payload)) {
    return payload as RegistryPayload[];
  }
  if (payload && typeof payload === "object") {
    const maybeServers = (payload as { servers?: unknown }).servers;
    if (Array.isArray(maybeServers)) {
      return maybeServers as RegistryPayload[];
    }
  }
  return [];
}

function buildQueries(seeds: CatalogProviderSeed[]): string[] {
  const values = new Set<string>();
  for (const seed of seeds) {
    if (seed.packageName) {
      values.add(seed.packageName);
    }
    if (seed.repoHint) {
      const normalizedRepo = normalizeRepositoryUrl(seed.repoHint).normalized;
      if (normalizedRepo) {
        values.add(normalizedRepo.split("/").slice(-2).join("/"));
      }
    }
    if (seed.rawText) {
      values.add(seed.rawText);
    }
  }
  return [...values].filter(Boolean).slice(0, 20);
}

function isOfficialRegistryServer(server: RegistryPayload): boolean {
  const official = server._meta && typeof server._meta === "object"
    ? (server._meta["io.modelcontextprotocol.registry/official"] as { status?: string } | undefined)
    : undefined;
  return official?.status === "active";
}

function normalizeRegistryServer(server: RegistryPayload, scopeKey: string): NormalizedCandidate {
  const repo = normalizeRepositoryUrl(server.repository?.url ?? null);
  const pkg = server.packages?.[0];
  const homepage = normalizeUrl(server.websiteUrl ?? repo.url);
  const name = server.title?.trim() || server.name?.trim() || "Registry MCP";

  return {
    sourceType: "registry",
    sourceNativeId: `registry:${normalizeCanonicalName(server.name ?? name) ?? slugify(name)}`,
    scopeKey,
    name,
    slug: slugify(name),
    description: (server.description?.trim() || `Registry corroboration for ${name}`).slice(0, 800),
    serverUrl: homepage,
    homepageUrl: homepage,
    repoUrl: repo.url,
    repoUrlNormalized: repo.normalized,
    category: "Developer Tools",
    authType: "none",
    tags: ["mcp", "registry", normalizeTag(pkg?.registryType)].filter((value): value is string => Boolean(value)),
    maintainer: {
      name: "MCP Registry",
    },
    identity: {
      canonicalName: normalizeCanonicalName(server.name ?? name),
      repoUrlNormalized: repo.normalized,
      packageType: normalizePackageName(pkg?.registryType ?? null),
      packageName: normalizePackageName(pkg?.identifier ?? null),
      packageVersion: pkg?.version?.trim() ?? null,
      homepageUrlNormalized: normalizeUrlForIdentity(homepage),
      serverUrlNormalized: normalizeUrlForIdentity(homepage),
    },
    sourceMeta: {
      registryName: server.name ?? null,
      registryTitle: server.title ?? null,
      official: isOfficialRegistryServer(server),
    },
    verificationHints: {
      repoMatch: Boolean(repo.normalized),
      packageExists: Boolean(pkg?.identifier),
      providerVerified: isOfficialRegistryServer(server),
      registryCorroborated: true,
      trustedPublishing: false,
      provenance: false,
      readmePresent: false,
      docsPresent: Boolean(homepage),
      healthStatus: "unknown",
      riskyFlags: [],
    },
  };
}

export function createRegistryCatalogProvider(options: { seeds?: CatalogProviderSeed[] } = {}): CatalogProvider {
  return {
    sourceType: "registry",
    supportsFullSweep: false,
    supportsConditionalFetch: false,
    buildScopeKey: () => "registry:corroboration",
    fetch: async ({ scopeKey, seeds = options.seeds ?? [], fetchImpl = fetch }) => {
      const queries = buildQueries(seeds);
      const rawCandidates = new Map<string, { sourceNativeId: string; payload: unknown; summary?: Record<string, unknown> }>();

      for (const query of queries) {
        const response = await withRetry(
          () =>
            fetchImpl(
              `https://registry.modelcontextprotocol.io/v0/servers?search=${encodeURIComponent(query)}&limit=20`,
              withRequestCachePolicy("providerSearch", {
                headers: {
                  Accept: "application/json",
                },
              }),
            ),
          { maxRetries: 2, baseDelayMs: 1000 },
        );

        if (!response.ok) {
          continue;
        }

        const servers = extractRegistryServers(await response.json());
        for (const server of servers) {
          const sourceNativeId = `registry:${normalizeCanonicalName(server.name ?? server.title ?? query) ?? slugify(query)}`;
          rawCandidates.set(sourceNativeId, {
            sourceNativeId,
            payload: server,
            summary: {
              query,
              name: server.name ?? server.title ?? null,
            },
          });
        }
      }

      return {
        scopeKey,
        rawCandidates: [...rawCandidates.values()],
        fullSweepCompleted: true,
        fetchMetadata: {
          httpStatus: 200,
          notModified: false,
          itemCount: rawCandidates.size,
        },
      };
    },
    normalize: async ({ rawCandidate, scopeKey }) => [
      normalizeRegistryServer(rawCandidate.payload as RegistryPayload, scopeKey),
    ],
  };
}
