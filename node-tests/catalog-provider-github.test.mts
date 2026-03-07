import assert from "node:assert/strict";
import test from "node:test";

import { createGitHubCatalogProvider } from "../frontend/lib/catalog/providers/github.ts";

test("github provider marks capped page windows as incomplete and skips safe stale cleanup", async () => {
  const provider = createGitHubCatalogProvider({
    maxPages: 1,
    pageLimit: 1,
    baselinePublishedSlugs: ["existing-server"],
  });

  const response = await provider.fetch({
    scopeKey: provider.buildScopeKey(),
    state: null,
    fetchImpl: async () =>
      new Response(
        JSON.stringify({
          items: [
            {
              full_name: "example/example-mcp",
              name: "example-mcp",
              html_url: "https://github.com/example/example-mcp",
              description: "Example MCP",
            },
          ],
        }),
        {
          status: 200,
          headers: {
            "content-type": "application/json",
          },
        },
      ),
  });

  assert.equal(response.fullSweepCompleted, false);
  assert.equal(response.staleCleanupAllowed, false);
  assert.equal(response.staleCandidateCount, 1);
  assert.deepEqual(response.stalePublishedSlugs, []);
});
