import assert from "node:assert/strict";
import test from "node:test";

import { runCatalogIngestionPipeline } from "../frontend/lib/catalog/core/pipeline.ts";
import type {
  CatalogIngestionStore,
  CatalogProvider,
  CatalogDedupeRecord,
  ProviderFetchResult,
  ProviderRawCandidate,
  NormalizedCandidate,
} from "../frontend/lib/catalog/core/types.ts";

function createRawCandidate(sourceType: string, sourceNativeId: string, payload: unknown): ProviderRawCandidate {
  return {
    sourceNativeId,
    payload,
    summary: { sourceNativeId },
  };
}

function createCandidate(overrides: Partial<NormalizedCandidate> = {}): NormalizedCandidate {
  return {
    sourceType: "github",
    sourceNativeId: "github:owner/repo",
    scopeKey: "github:default",
    name: "Example MCP",
    slug: "example-mcp",
    description: "Example MCP server",
    serverUrl: "https://example.com",
    homepageUrl: "https://example.com",
    repoUrl: "https://github.com/example/example-mcp",
    repoUrlNormalized: "github.com/example/example-mcp",
    category: "Developer Tools",
    authType: "none",
    tags: ["mcp"],
    maintainer: { name: "Example" },
    identity: {
      canonicalName: "example-mcp",
      repoUrlNormalized: "github.com/example/example-mcp",
      packageType: null,
      packageName: null,
      packageVersion: null,
      homepageUrlNormalized: "https://example.com/",
      serverUrlNormalized: "https://example.com/",
    },
    sourceMeta: {},
    verificationHints: {
      repoMatch: true,
      packageExists: false,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: true,
      docsPresent: true,
      healthStatus: "unknown",
      riskyFlags: [],
    },
    ...overrides,
  };
}

function createStore(overrides: Partial<CatalogIngestionStore> = {}): CatalogIngestionStore & {
  publishedRows: Array<Record<string, unknown>>;
  staleMarks: string[];
} {
  const publishedRows: Array<Record<string, unknown>> = [];
  const staleMarks: string[] = [];

  return {
    publishedRows,
    staleMarks,
    loadSourceState: async () => null,
    recordSourceAttempt: async () => undefined,
    recordSourceSuccess: async () => undefined,
    recordSourceFailure: async () => undefined,
    recordRawCandidate: async () => "raw-1",
    loadDedupeRecords: async () => [],
    upsertServerSource: async () => "source-row-1",
    recordVerificationRun: async () => undefined,
    publishCandidate: async (input) => {
      publishedRows.push(input);
      return {
        created: true,
        changed: true,
        serverId: `server-${publishedRows.length}`,
        slug: input.mergedCandidate.slug,
      };
    },
    loadAutoManagedRecords: async () => [],
    markStaleCandidate: async (slug) => {
      staleMarks.push(slug);
      return { changed: true, rejected: false };
    },
    ...overrides,
  };
}

function createProvider(
  sourceType: CatalogProvider["sourceType"],
  candidates: NormalizedCandidate[],
  rawCandidates: ProviderRawCandidate[] = candidates.map((candidate) =>
    createRawCandidate(sourceType, candidate.sourceNativeId, { slug: candidate.slug }),
  ),
): CatalogProvider {
  const fetchResult: ProviderFetchResult = {
    scopeKey: `${sourceType}:default`,
    fullSweepCompleted: true,
    rawCandidates,
    stalePublishedSlugs: sourceType === "github" ? ["missing-github-row"] : [],
    fetchMetadata: {
      httpStatus: 200,
      notModified: false,
      itemCount: rawCandidates.length,
    },
  };

  return {
    sourceType,
    supportsFullSweep: sourceType === "github",
    supportsConditionalFetch: false,
    buildScopeKey: () => `${sourceType}:default`,
    fetch: async () => fetchResult,
    normalize: async () => candidates,
  };
}

test("pipeline publishes corroborated candidates, quarantines weak ones, and tolerates source failure", async () => {
  const githubCandidate = createCandidate({
    sourceType: "github",
    sourceNativeId: "github:example/example-mcp",
  });
  const smitheryCandidate = createCandidate({
    sourceType: "smithery",
    sourceNativeId: "smithery:example",
    verificationHints: {
      ...githubCandidate.verificationHints,
      providerVerified: true,
    },
  });
  const weakCandidate = createCandidate({
    sourceType: "pypi",
    sourceNativeId: "pypi:weak-example",
    slug: "weak-example",
    name: "Weak Example",
    description: "Weak example",
    repoUrl: null,
    repoUrlNormalized: null,
    identity: {
      canonicalName: "weak-example",
      repoUrlNormalized: null,
      packageType: "pypi",
      packageName: "weak-example",
      packageVersion: "0.1.0",
      homepageUrlNormalized: null,
      serverUrlNormalized: null,
    },
    verificationHints: {
      repoMatch: false,
      packageExists: true,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: false,
      docsPresent: false,
      healthStatus: "unknown",
      riskyFlags: [],
    },
  });

  const store = createStore();
  const result = await runCatalogIngestionPipeline(
    {
      runId: "run-1",
      providers: [
        createProvider("github", [githubCandidate]),
        createProvider("smithery", [smitheryCandidate]),
        createProvider("pypi", [weakCandidate]),
        {
          sourceType: "npm",
          supportsFullSweep: false,
          supportsConditionalFetch: false,
          buildScopeKey: () => "npm:default",
          fetch: async () => {
            throw new Error("npm unavailable");
          },
          normalize: async () => [],
        },
      ],
      store,
      sourceTypes: ["github", "smithery", "pypi", "npm"],
      logger: {
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
      },
    },
  );

  assert.equal(result.published, 1);
  assert.equal(result.quarantined, 1);
  assert.equal(result.failed, 1);
  assert.deepEqual([...result.changedSlugs].sort(), ["example-mcp", "missing-github-row"]);
  assert.equal(store.publishedRows.length, 1);
  assert.deepEqual(store.staleMarks, ["missing-github-row"]);
});

test("pipeline does not mutate protected manual rows and records them as quarantined", async () => {
  const store = createStore({
    loadDedupeRecords: async (): Promise<CatalogDedupeRecord[]> => [
      {
        serverId: "manual-1",
        slug: "manual-example",
        name: "Manual Example",
        tags: [],
        ownerUserId: "user-1",
        protectedManual: true,
        canonicalNames: ["manual-example"],
        repoUrlsNormalized: ["github.com/example/manual-example"],
        packageIdentities: [],
        homepageUrlsNormalized: [],
        serverUrlsNormalized: [],
      },
    ],
  });

  const result = await runCatalogIngestionPipeline(
    {
      runId: "run-2",
      providers: [
        createProvider("github", [
          createCandidate({
            sourceNativeId: "github:example/manual-example",
            slug: "manual-example",
            repoUrl: "https://github.com/example/manual-example",
            repoUrlNormalized: "github.com/example/manual-example",
            identity: {
              canonicalName: "manual-example",
              repoUrlNormalized: "github.com/example/manual-example",
              packageType: null,
              packageName: null,
              packageVersion: null,
              homepageUrlNormalized: null,
              serverUrlNormalized: null,
            },
          }),
        ]),
      ],
      store,
      sourceTypes: ["github"],
      logger: {
        info: () => undefined,
        warn: () => undefined,
        error: () => undefined,
      },
    },
  );

  assert.equal(result.published, 0);
  assert.equal(result.quarantined, 1);
  assert.equal(store.publishedRows.length, 0);
});
