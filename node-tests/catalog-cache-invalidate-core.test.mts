import assert from "node:assert/strict";
import test from "node:test";

import { executeCatalogCacheInvalidate } from "../frontend/lib/catalog/cache-invalidate-core.ts";

test("catalog cache invalidate core rejects empty payload", async () => {
  const response = await executeCatalogCacheInvalidate({
    parseJsonBody: async () => ({}),
    invalidate: () => undefined,
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
});

test("catalog cache invalidate core dedupes slugs and forwards includeAdmin", async () => {
  let observed: { changedSlugs: string[]; includeAdmin: boolean } | null = null;

  const response = await executeCatalogCacheInvalidate({
    parseJsonBody: async () => ({
      changedSlugs: [" github ", "github", "postgres"],
      includeAdmin: true,
    }),
    invalidate: (input) => {
      observed = input;
    },
  });

  assert.equal(response.status, 200);
  assert.deepEqual(observed, {
    changedSlugs: ["github", "postgres"],
    includeAdmin: true,
  });
});
