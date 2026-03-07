import assert from "node:assert/strict";
import test from "node:test";

import { createGitHubCatalogProvider } from "../frontend/lib/catalog/providers/github.ts";

test("github provider throttles README enrichment fan-out", async () => {
  let readmeCalls = 0;
  const provider = createGitHubCatalogProvider({
    readmeFetchLimit: 1,
    readmeFetcher: async () => {
      readmeCalls += 1;
      return {
        content: "# Example",
        tools: ["one"],
      };
    },
  });

  const repos = [
    {
      full_name: "example/one",
      name: "one",
      html_url: "https://github.com/example/one",
      description: "one",
      owner: { login: "example" },
    },
    {
      full_name: "example/two",
      name: "two",
      html_url: "https://github.com/example/two",
      description: "two",
      owner: { login: "example" },
    },
  ];

  for (const repo of repos) {
    await provider.normalize({
      rawCandidate: {
        sourceNativeId: `github:${repo.full_name}`,
        payload: repo,
      },
      scopeKey: "github:test",
    });
  }

  assert.equal(readmeCalls, 1);
});
