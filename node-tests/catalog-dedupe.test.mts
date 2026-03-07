import assert from "node:assert/strict";
import test from "node:test";

import {
  matchCatalogCandidate,
  type CatalogDedupeRecord,
} from "../frontend/lib/catalog/core/dedupe.ts";
import type { NormalizedCandidate } from "../frontend/lib/catalog/core/types.ts";

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
    tags: ["mcp", "github"],
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

function createRecord(overrides: Partial<CatalogDedupeRecord> = {}): CatalogDedupeRecord {
  return {
    serverId: "server-1",
    slug: "example-mcp",
    name: "Example MCP",
    tags: ["registry-auto"],
    ownerUserId: null,
    protectedManual: false,
    canonicalNames: ["example-mcp"],
    repoUrlsNormalized: ["github.com/example/example-mcp"],
    packageIdentities: [],
    homepageUrlsNormalized: ["https://example.com/"],
    serverUrlsNormalized: ["https://example.com/"],
    ...overrides,
  };
}

test("manual override wins before canonical matching", () => {
  const candidate = createCandidate({
    sourceType: "smithery",
    sourceNativeId: "smithery:123",
  });
  const records = [
    createRecord({ serverId: "server-1" }),
    createRecord({ serverId: "server-2", slug: "manual-target" }),
  ];

  const result = matchCatalogCandidate({
    candidate,
    records,
    manualOverrideMap: {
      "smithery:smithery:123": "server-2",
    },
  });

  assert.equal(result?.serverId, "server-2");
  assert.equal(result?.matchType, "manual_override");
});

test("matches by normalized repo URL before other anchors and explains why", () => {
  const candidate = createCandidate({
    slug: "different-slug",
    identity: {
      canonicalName: "different-canonical-name",
      repoUrlNormalized: "github.com/example/example-mcp",
      packageType: "npm",
      packageName: "@example/example-mcp",
      packageVersion: "1.0.0",
      homepageUrlNormalized: "https://example.com/",
      serverUrlNormalized: "https://example.com/",
    },
  });

  const result = matchCatalogCandidate({
    candidate,
    records: [
      createRecord({
        packageIdentities: [{ packageType: "npm", packageName: "@example/example-mcp" }],
      }),
    ],
  });

  assert.equal(result?.serverId, "server-1");
  assert.equal(result?.matchType, "repo_url");
  assert.match(result?.explainability ?? "", /repo/i);
});

test("matches by package identity when repo URL is absent", () => {
  const candidate = createCandidate({
    repoUrl: null,
    repoUrlNormalized: null,
    identity: {
      canonicalName: "python-example",
      repoUrlNormalized: null,
      packageType: "pypi",
      packageName: "python-example-mcp",
      packageVersion: "0.5.0",
      homepageUrlNormalized: null,
      serverUrlNormalized: null,
    },
  });

  const result = matchCatalogCandidate({
    candidate,
    records: [
      createRecord({
        repoUrlsNormalized: [],
        homepageUrlsNormalized: [],
        serverUrlsNormalized: [],
        packageIdentities: [{ packageType: "pypi", packageName: "python-example-mcp" }],
      }),
    ],
  });

  assert.equal(result?.serverId, "server-1");
  assert.equal(result?.matchType, "package_identity");
});

test("does not merge on display name alone", () => {
  const candidate = createCandidate({
    name: "Shared Name",
    identity: {
      canonicalName: "shared-name",
      repoUrlNormalized: null,
      packageType: null,
      packageName: null,
      packageVersion: null,
      homepageUrlNormalized: null,
      serverUrlNormalized: null,
    },
  });

  const result = matchCatalogCandidate({
    candidate,
    records: [
      createRecord({
        name: "Shared Name",
        canonicalNames: ["another-name"],
        repoUrlsNormalized: [],
        packageIdentities: [],
        homepageUrlsNormalized: [],
        serverUrlsNormalized: [],
      }),
    ],
  });

  assert.equal(result, null);
});

test("does not merge on canonical name alone without a stronger anchor", () => {
  const candidate = createCandidate({
    repoUrl: null,
    repoUrlNormalized: null,
    homepageUrl: null,
    serverUrl: null,
    identity: {
      canonicalName: "same-canonical-name",
      repoUrlNormalized: null,
      packageType: null,
      packageName: null,
      packageVersion: null,
      homepageUrlNormalized: null,
      serverUrlNormalized: null,
    },
  });

  const result = matchCatalogCandidate({
    candidate,
    records: [
      createRecord({
        canonicalNames: ["same-canonical-name"],
        repoUrlsNormalized: [],
        packageIdentities: [],
        homepageUrlsNormalized: [],
        serverUrlsNormalized: [],
      }),
    ],
  });

  assert.equal(result, null);
});
