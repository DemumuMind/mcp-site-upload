import assert from "node:assert/strict";
import test from "node:test";

import { verifyCatalogCandidate } from "../frontend/lib/catalog/core/verify.ts";
import type { NormalizedCandidate } from "../frontend/lib/catalog/core/types.ts";

function createCandidate(overrides: Partial<NormalizedCandidate> = {}): NormalizedCandidate {
  return {
    sourceType: "github",
    sourceNativeId: "github:owner/repo",
    scopeKey: "github:default",
    name: "Example MCP",
    slug: "example-mcp",
    description: "Production MCP server for repositories",
    serverUrl: "https://example.com",
    homepageUrl: "https://example.com",
    repoUrl: "https://github.com/example/example-mcp",
    repoUrlNormalized: "github.com/example/example-mcp",
    category: "Developer Tools",
    authType: "oauth",
    tags: ["mcp", "github"],
    maintainer: { name: "Example" },
    identity: {
      canonicalName: "example-mcp",
      repoUrlNormalized: "github.com/example/example-mcp",
      packageType: "npm",
      packageName: "@example/example-mcp",
      packageVersion: "1.0.0",
      homepageUrlNormalized: "https://example.com/",
      serverUrlNormalized: "https://example.com/",
    },
    sourceMeta: {},
    verificationHints: {
      repoMatch: true,
      packageExists: true,
      providerVerified: false,
      trustedPublishing: false,
      provenance: false,
      readmePresent: true,
      docsPresent: true,
      healthStatus: "healthy",
      riskyFlags: [],
    },
    ...overrides,
  };
}

test("publishes corroborated candidate with strong anchors", () => {
  const result = verifyCatalogCandidate({
    candidate: createCandidate({
      verificationHints: {
        repoMatch: true,
        packageExists: true,
        providerVerified: true,
        trustedPublishing: true,
        provenance: true,
        readmePresent: true,
        docsPresent: true,
        healthStatus: "healthy",
        riskyFlags: [],
      },
    }),
    corroboratingSources: ["github", "npm", "smithery"],
  });

  assert.equal(result.decision, "publish");
  assert.equal(result.verificationLevel, "official");
  assert.ok(result.trustScore >= 80);
  assert.ok(result.reasons.some((reason) => reason.includes("corroborated")));
});

test("quarantines weak single-source candidates instead of publishing them", () => {
  const result = verifyCatalogCandidate({
    candidate: createCandidate({
      sourceType: "pypi",
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
    }),
    corroboratingSources: ["pypi"],
  });

  assert.equal(result.decision, "quarantine");
  assert.equal(result.verificationLevel, "community");
  assert.ok(result.trustScore < 60);
});

test("rejects obvious test and staging candidates", () => {
  const result = verifyCatalogCandidate({
    candidate: createCandidate({
      name: "Example MCP Staging",
      slug: "example-mcp-staging",
      verificationHints: {
        repoMatch: false,
        packageExists: false,
        providerVerified: false,
        trustedPublishing: false,
        provenance: false,
        readmePresent: false,
        docsPresent: false,
        healthStatus: "unknown",
        riskyFlags: ["staging", "test"],
      },
    }),
    corroboratingSources: ["github"],
  });

  assert.equal(result.decision, "reject");
  assert.ok(result.reasons.some((reason) => /staging|test/i.test(reason)));
});
