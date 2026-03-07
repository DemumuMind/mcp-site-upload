import { z } from "zod";
import { withRetry } from "../../api/fetch-with-retry.ts";
import { withRequestCachePolicy } from "../../cache/policy.ts";
import {
  normalizeCanonicalName,
  normalizeRepositoryUrl,
  normalizeTag,
  normalizeUrlForIdentity,
  slugify,
} from "../core/normalize.ts";
import type { AuthType } from "../../types";
import type { CatalogProvider, NormalizedCandidate } from "../core/types.ts";

const SmitheryServerSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().default(""),
  owner: z.string().optional(),
  repoUrl: z.string().optional(),
  homepage: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  readme: z.string().optional(),
  verified: z.boolean().optional().default(false),
});

const SmitheryApiResponseSchema = z.union([
  z.object({ servers: z.array(SmitheryServerSchema) }),
  z.array(SmitheryServerSchema),
]);

type SmitheryServer = z.infer<typeof SmitheryServerSchema>;

function inferAuthType(description: string): AuthType {
  const normalized = description.toLowerCase();
  if (normalized.includes("oauth")) {
    return "oauth";
  }
  if (normalized.includes("token") || normalized.includes("api key")) {
    return "api_key";
  }
  return "none";
}

function inferCategory(description: string, tags: string[]): string {
  const content = `${description} ${tags.join(" ")}`.toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(content)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(content)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(content)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(content)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(content)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(content)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

function normalizeSmitheryServer(server: SmitheryServer, scopeKey: string): NormalizedCandidate {
  const repo = normalizeRepositoryUrl(server.repoUrl ?? null);
  const homepage = server.homepage?.trim() || repo.url;
  const tags = [...new Set(["mcp", "smithery", "smithery-sync", ...server.tags.map((tag) => normalizeTag(tag)).filter((value): value is string => Boolean(value))])];

  return {
    sourceType: "smithery",
    sourceNativeId: `smithery:${server.id}`,
    scopeKey,
    name: server.name,
    slug: slugify(server.name),
    description: (server.description || `MCP server from Smithery registry: ${server.name}`).slice(0, 800),
    serverUrl: homepage,
    homepageUrl: homepage,
    repoUrl: repo.url,
    repoUrlNormalized: repo.normalized,
    category: inferCategory(server.description, server.tags),
    authType: inferAuthType(server.description),
    tags,
    maintainer: {
      name: server.owner || "Smithery Community",
    },
    identity: {
      canonicalName: normalizeCanonicalName(server.name),
      repoUrlNormalized: repo.normalized,
      packageType: null,
      packageName: null,
      packageVersion: null,
      homepageUrlNormalized: normalizeUrlForIdentity(homepage),
      serverUrlNormalized: normalizeUrlForIdentity(homepage),
    },
    sourceMeta: {
      readmePreview: server.readme?.slice(0, 1000) ?? null,
      verified: server.verified,
    },
    verificationHints: {
      repoMatch: Boolean(repo.normalized),
      packageExists: false,
      providerVerified: server.verified,
      smitheryVerified: server.verified,
      trustedPublishing: false,
      provenance: false,
      readmePresent: Boolean(server.readme?.trim()),
      docsPresent: Boolean(homepage),
      healthStatus: "unknown",
      riskyFlags: /\b(test|demo|staging|template)\b/i.test(`${server.name} ${server.description}`)
        ? ["staging_or_test"]
        : [],
    },
  };
}

export function createSmitheryCatalogProvider(): CatalogProvider {
  return {
    sourceType: "smithery",
    supportsFullSweep: true,
    supportsConditionalFetch: false,
    buildScopeKey: () => "smithery:registry",
    fetch: async ({ scopeKey, fetchImpl = fetch }) => {
      const response = await withRetry(
        () =>
          fetchImpl(
            "https://api.smithery.ai/servers",
            withRequestCachePolicy("providerSearch", {
              headers: {
                Accept: "application/json",
                ...(process.env.SMITHERY_API_KEY ? { Authorization: `Bearer ${process.env.SMITHERY_API_KEY}` } : {}),
              },
            }),
          ),
        { maxRetries: 2, baseDelayMs: 1000 },
      );

      if (!response.ok) {
        throw new Error(`Smithery API failed (${response.status})`);
      }

      const payload = SmitheryApiResponseSchema.parse(await response.json());
      const servers = Array.isArray(payload) ? payload : payload.servers;
      return {
        scopeKey,
        rawCandidates: servers.map((server) => ({
          sourceNativeId: `smithery:${server.id}`,
          payload: server,
          summary: {
            name: server.name,
            repoUrl: server.repoUrl ?? null,
          },
        })),
        fullSweepCompleted: true,
        fetchMetadata: {
          httpStatus: 200,
          notModified: false,
          itemCount: servers.length,
        },
      };
    },
    normalize: async ({ rawCandidate, scopeKey }) => [
      normalizeSmitheryServer(rawCandidate.payload as SmitheryServer, scopeKey),
    ],
  };
}
