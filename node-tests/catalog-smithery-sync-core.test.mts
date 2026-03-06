import assert from "node:assert/strict";
import test from "node:test";

import * as smitherySyncCoreModule from "../frontend/lib/catalog/smithery-sync-core.ts";

const { executeCatalogSmitherySync } = smitherySyncCoreModule;

test("smithery-sync core returns a stable 500 payload on internal failure", async () => {
  const response = await executeCatalogSmitherySync({
    runSync: async () => {
      throw new Error("boom");
    },
    onSuccess: async () => undefined,
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Catalog Smithery sync failed.",
      code: "internal_error",
    },
  });
});
