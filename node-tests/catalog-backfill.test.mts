import assert from "node:assert/strict";
import test from "node:test";

import { buildLegacyServerSourceBackfillRows } from "../frontend/lib/catalog/core/legacy-source-backfill.ts";

test("builds legacy backfill rows for existing auto-managed servers", () => {
  const rows = buildLegacyServerSourceBackfillRows([
    {
      id: "server-1",
      slug: "example-mcp",
      name: "Example MCP",
      repo_url: "https://github.com/example/example-mcp",
      server_url: "https://example.com",
      tags: ["registry-auto", "github-sync"],
    },
    {
      id: "server-2",
      slug: "registry-only",
      name: "Registry Only",
      repo_url: null,
      server_url: "https://registry-only.example.com",
      tags: ["registry-auto", "scrapy-sync"],
    },
  ]);

  assert.equal(rows.length, 2);
  assert.deepEqual(rows.map((row) => row.sourceType), ["github", "registry"]);
  assert.equal(rows[0].repoUrlNormalized, "github.com/example/example-mcp");
});
