import assert from "node:assert/strict";
import test from "node:test";

import { createRegistryCatalogProvider } from "../frontend/lib/catalog/providers/registry.ts";

test("registry provider normalizes corroboration records without publishing them directly", async () => {
  const provider = createRegistryCatalogProvider({
    seeds: [{ packageName: "example-mcp", repoHint: "https://github.com/example/example-mcp" }],
  });

  const fetchResult = await provider.fetch({
    scopeKey: provider.buildScopeKey(),
    state: null,
    seeds: [{ packageName: "example-mcp", repoHint: "https://github.com/example/example-mcp" }],
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          servers: [
            {
              name: "ai.example/example-mcp",
              description: "Registry example",
              repository: {
                url: "https://github.com/example/example-mcp",
                source: "github",
              },
              packages: [
                {
                  registryType: "npm",
                  identifier: "@example/example-mcp",
                  version: "1.2.3",
                },
              ],
              websiteUrl: "https://example.com/docs",
              _meta: {
                "io.modelcontextprotocol.registry/official": {
                  status: "active",
                  isLatest: true,
                },
              },
            },
          ],
        }),
        { status: 200, headers: { "content-type": "application/json" } },
      ),
  });

  assert.equal(fetchResult.rawCandidates.length, 1);

  const [candidate] = await provider.normalize({
    rawCandidate: fetchResult.rawCandidates[0],
    scopeKey: fetchResult.scopeKey,
  });

  assert.equal(candidate.sourceType, "registry");
  assert.equal(candidate.repoUrlNormalized, "github.com/example/example-mcp");
  assert.equal(candidate.identity.packageType, "npm");
  assert.equal(candidate.verificationHints.providerVerified, true);
  assert.equal(candidate.verificationHints.registryCorroborated, true);
});
