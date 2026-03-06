import assert from "node:assert/strict";
import test from "node:test";

import * as healthCoreModule from "../frontend/lib/catalog/health-check-core.ts";
import * as npmSyncCoreModule from "../frontend/lib/catalog/npm-sync-core.ts";

const { executeCatalogHealthCheck } = healthCoreModule;
const { executeCatalogNpmSync } = npmSyncCoreModule;

test("health-check core returns a stable 500 payload on internal failure", async () => {
  const response = await executeCatalogHealthCheck({
    runHealthCheck: async () => {
      throw new Error("boom");
    },
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Catalog health check failed.",
      code: "internal_error",
    },
  });
});

test("npm-sync core returns a stable 500 payload on internal failure", async () => {
  const response = await executeCatalogNpmSync({
    runSync: async () => {
      throw new Error("boom");
    },
    onSuccess: async () => undefined,
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Catalog npm sync failed.",
      code: "internal_error",
    },
  });
});
