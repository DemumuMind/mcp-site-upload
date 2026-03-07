import {
  normalizeTag,
  normalizeUrlForIdentity,
} from "../core/normalize.ts";
import type { CatalogProvider, CatalogProviderSeed, NormalizedCandidate } from "../core/types.ts";

export type OciImageReference = {
  registryHost: string;
  imageName: string;
  tag: string | null;
  digest: string | null;
  canonicalRef: string;
};

const SUPPORTED_REGISTRIES = new Set(["ghcr.io", "docker.io"]);

export function normalizeOciImageReference(rawValue: string): OciImageReference | null {
  const trimmed = rawValue.trim();
  const match = trimmed.match(/^([a-z0-9.-]+\.[a-z]{2,})\/([a-z0-9/_-]+?)(?:(?::([a-z0-9._-]+))|(?:@(sha256:[a-f0-9]+)))$/i);
  if (!match) {
    return null;
  }

  const [, host, image, tagMatch, digestMatch] = match;
  const registryHost = host.toLowerCase();
  if (!SUPPORTED_REGISTRIES.has(registryHost)) {
    return null;
  }

  if (registryHost.includes("localhost") || registryHost.startsWith("127.") || registryHost.startsWith("10.")) {
    return null;
  }

  const imageName = image.toLowerCase().replace(/^library\//, "library/");
  const tag = tagMatch?.toLowerCase() ?? null;
  const digest = digestMatch?.toLowerCase() ?? null;

  return {
    registryHost,
    imageName,
    tag,
    digest,
    canonicalRef: `${registryHost}/${imageName}${tag ? `:${tag}` : `@${digest}`}`,
  };
}

export function extractImageReferencesFromText(text: string): OciImageReference[] {
  const matches = text.match(/[a-z0-9.-]+\.[a-z]{2,}\/[a-z0-9/_-]+(?::[a-z0-9._-]+|@sha256:[a-f0-9]+)/gi) ?? [];
  const seen = new Set<string>();
  const refs: OciImageReference[] = [];

  for (const match of matches) {
    const normalized = normalizeOciImageReference(match);
    if (!normalized || seen.has(normalized.canonicalRef)) {
      continue;
    }
    seen.add(normalized.canonicalRef);
    refs.push(normalized);
  }

  return refs;
}

function buildSeeds(seeds: CatalogProviderSeed[]): OciImageReference[] {
  const refs: OciImageReference[] = [];
  for (const seed of seeds) {
    for (const text of [seed.rawText, seed.repoHint, seed.packageName]) {
      if (!text) {
        continue;
      }
      refs.push(...extractImageReferencesFromText(text));
    }
  }
  return refs;
}

export function createOciProvider(seeds: CatalogProviderSeed[] = []): CatalogProvider {
  return {
  sourceType: "oci",
  supportsFullSweep: false,
  supportsConditionalFetch: false,
  buildScopeKey: (input) => `oci:${input?.seed ?? input?.sourceScope ?? "default"}`,
  fetch: async ({ seeds: providerSeeds = seeds, scopeKey, fetchImpl = fetch }) => {
    const refs = [...new Map(buildSeeds(providerSeeds).map((ref) => [ref.canonicalRef, ref])).values()];
    const rawCandidates = [];

    for (const ref of refs) {
      if (ref.registryHost === "ghcr.io") {
        const [owner, packageName] = ref.imageName.split("/", 2);
        const response = await fetchImpl(`https://api.github.com/users/${owner}/packages/container/${packageName}/versions`, {
          headers: {
            Accept: "application/vnd.github+json",
            ...(process.env.GH_API_TOKEN || process.env.GITHUB_TOKEN
              ? { Authorization: `Bearer ${process.env.GH_API_TOKEN || process.env.GITHUB_TOKEN}` }
              : {}),
          },
        });
        if (response.ok) {
          rawCandidates.push({
            sourceNativeId: `oci:${ref.canonicalRef}`,
            payload: {
              versions: await response.json(),
              ref,
            },
            summary: { canonicalRef: ref.canonicalRef },
          });
        }
        continue;
      }

      const [namespace, repository] = ref.imageName.split("/", 2);
      const tag = ref.tag ?? "latest";
      const response = await fetchImpl(`https://hub.docker.com/v2/repositories/${namespace}/${repository}/tags/${tag}`, {
        headers: {
          Accept: "application/json",
        },
      });
      if (response.ok) {
        rawCandidates.push({
          sourceNativeId: `oci:${ref.canonicalRef}`,
          payload: {
            tag: await response.json(),
            ref,
          },
          summary: { canonicalRef: ref.canonicalRef },
        });
      }
    }

    return {
      scopeKey,
      rawCandidates,
      fullSweepCompleted: true,
      fetchMetadata: {
        httpStatus: rawCandidates.length > 0 ? 200 : 204,
        notModified: false,
        itemCount: rawCandidates.length,
      },
    };
  },
  normalize: async ({ rawCandidate, scopeKey }) => {
    const payload = rawCandidate.payload as { ref: OciImageReference; versions?: unknown[]; tag?: { last_updated?: string } };
    const ref = payload.ref;

    const candidate: NormalizedCandidate = {
      sourceType: "oci",
      sourceNativeId: rawCandidate.sourceNativeId,
      scopeKey,
      name: ref.imageName.split("/").at(-1) ?? ref.imageName,
      slug: (ref.imageName.split("/").at(-1) ?? ref.imageName).replace(/[^a-z0-9-]+/gi, "-").toLowerCase(),
      description: `OCI image ${ref.canonicalRef}`,
      serverUrl: null,
      homepageUrl: null,
      repoUrl: null,
      repoUrlNormalized: null,
      category: "Cloud Platforms",
      authType: "none",
      tags: ["mcp", "oci", normalizeTag(ref.registryHost)].filter((value): value is string => Boolean(value)),
      maintainer: { name: ref.registryHost },
      identity: {
        canonicalName: ref.imageName.split("/").at(-1) ?? null,
        repoUrlNormalized: null,
        packageType: "oci",
        packageName: ref.canonicalRef,
        packageVersion: ref.tag ?? ref.digest,
        homepageUrlNormalized: null,
        serverUrlNormalized: normalizeUrlForIdentity(`https://${ref.canonicalRef}`),
      },
      sourceMeta: {
        registryHost: ref.registryHost,
        imageName: ref.imageName,
        tag: ref.tag,
        digest: ref.digest,
        pushedAt: payload.tag?.last_updated ?? null,
      },
      verificationHints: {
        repoMatch: false,
        packageExists: true,
        providerVerified: ref.registryHost === "ghcr.io",
        trustedPublishing: false,
        provenance: false,
        readmePresent: false,
        docsPresent: false,
        healthStatus: "unknown",
        riskyFlags: [],
      },
    };

    return [candidate];
  },
  };
}

export const ociProvider = createOciProvider();
