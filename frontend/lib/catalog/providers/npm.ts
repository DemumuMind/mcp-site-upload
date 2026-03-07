import { z } from "zod";
import { withRetry } from "../../api/fetch-with-retry.ts";
import { withRequestCachePolicy } from "../../cache/policy.ts";
import type { AuthType } from "../../types";
import {
  normalizeCanonicalName,
  normalizePackageName,
  normalizeRepositoryUrl,
  normalizeTag,
  normalizeUrl,
  normalizeUrlForIdentity,
  slugify,
} from "../core/normalize.ts";
import type { CatalogProvider, NormalizedCandidate } from "../core/types.ts";

const NpmPackageSchema = z.object({
  package: z.object({
    name: z.string(),
    version: z.string(),
    description: z.string().optional().default(""),
    keywords: z.array(z.string()).optional().default([]),
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
});

const NpmSearchResponseSchema = z.object({
  objects: z.array(NpmPackageSchema),
});

type NpmPackage = z.infer<typeof NpmPackageSchema>;

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

function inferCategory(description: string, keywords: string[]): string {
  const content = `${description} ${keywords.join(" ")}`.toLowerCase();
  if (/(search|crawler|crawl|retriev)/.test(content)) return "Search";
  if (/(database|postgres|mysql|sql|redis|mongodb)/.test(content)) return "Databases";
  if (/(github|gitlab|repo|code|devtools|developer)/.test(content)) return "Developer Tools";
  if (/(slack|discord|message|chat|email|teams)/.test(content)) return "Communication";
  if (/(notion|asana|trello|jira|task|productivity)/.test(content)) return "Calendar & Productivity";
  if (/(aws|gcp|azure|vercel|cloud|kubernetes|docker)/.test(content)) return "Cloud Platforms";
  return "Other Tools and Integrations";
}

function normalizeNpmPackage(item: NpmPackage, scopeKey: string): NormalizedCandidate {
  const pkg = item.package;
  const repo = normalizeRepositoryUrl(pkg.links.repository ?? null);
  const homepage = normalizeUrl(pkg.links.homepage ?? pkg.links.npm);
  const tags = [...new Set(["mcp", "npm", "npm-sync", ...pkg.keywords.map((tag) => normalizeTag(tag)).filter((value): value is string => Boolean(value))])];

  return {
    sourceType: "npm",
    sourceNativeId: `npm:${normalizePackageName(pkg.name)}`,
    scopeKey,
    name: pkg.name,
    slug: slugify(pkg.name.replace(/^@/, "").replace(/\//g, "-")),
    description: (pkg.description?.trim() || `NPM package ${pkg.name}`).slice(0, 800),
    serverUrl: homepage,
    homepageUrl: homepage,
    repoUrl: repo.url,
    repoUrlNormalized: repo.normalized,
    category: inferCategory(pkg.description, pkg.keywords),
    authType: inferAuthType(pkg.description),
    tags,
    maintainer: {
      name: pkg.publisher?.username || pkg.maintainers[0]?.username || "npm publisher",
    },
    identity: {
      canonicalName: normalizeCanonicalName(pkg.name),
      repoUrlNormalized: repo.normalized,
      packageType: "npm",
      packageName: normalizePackageName(pkg.name),
      packageVersion: pkg.version,
      homepageUrlNormalized: normalizeUrlForIdentity(homepage),
      serverUrlNormalized: normalizeUrlForIdentity(homepage),
    },
    sourceMeta: {
      npmUrl: pkg.links.npm,
      keywords: pkg.keywords,
    },
    verificationHints: {
      repoMatch: Boolean(repo.normalized),
      packageExists: true,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: Boolean(pkg.description?.trim()),
      docsPresent: Boolean(homepage),
      healthStatus: "unknown",
      riskyFlags: /\b(test|demo|staging|template)\b/i.test(`${pkg.name} ${pkg.description}`)
        ? ["staging_or_test"]
        : [],
    },
  };
}

export function createNpmCatalogProvider(): CatalogProvider {
  return {
    sourceType: "npm",
    supportsFullSweep: true,
    supportsConditionalFetch: false,
    buildScopeKey: () => "npm:keywords:mcp-server",
    fetch: async ({ scopeKey, fetchImpl = fetch }) => {
      const response = await withRetry(
        () =>
          fetchImpl(
            "https://registry.npmjs.org/-/v1/search?text=keywords:mcp-server&size=250",
            withRequestCachePolicy("providerSearch", {
              headers: { Accept: "application/json" },
            }),
          ),
        { maxRetries: 2, baseDelayMs: 1000 },
      );

      if (!response.ok) {
        throw new Error(`npm registry failed (${response.status})`);
      }

      const payload = NpmSearchResponseSchema.parse(await response.json());
      return {
        scopeKey,
        rawCandidates: payload.objects.map((item) => ({
          sourceNativeId: `npm:${normalizePackageName(item.package.name)}`,
          payload: item,
          summary: {
            packageName: item.package.name,
            repoUrl: item.package.links.repository ?? null,
          },
        })),
        fullSweepCompleted: true,
        fetchMetadata: {
          httpStatus: 200,
          notModified: false,
          itemCount: payload.objects.length,
        },
      };
    },
    normalize: async ({ rawCandidate, scopeKey }) => [
      normalizeNpmPackage(rawCandidate.payload as NpmPackage, scopeKey),
    ],
  };
}
