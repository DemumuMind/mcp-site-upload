import assert from "node:assert/strict";
import test from "node:test";

import * as syncAllCoreModule from "../frontend/lib/catalog/sync-all-core.ts";

const { executeCatalogSyncAll } = syncAllCoreModule;

function createBaseDeps() {
  return {
    lockKey: "catalog:sync-all",
    acquireLock: async () => ({ acquired: true }),
    startRun: async () => "run-1",
    finishRun: async () => undefined,
    recordFailures: async () => undefined,
    releaseLock: async () => undefined,
    runGithubSync: async () => {
      throw new Error("not configured");
    },
    runSmitherySync: async () => {
      throw new Error("not configured");
    },
    runNpmSync: async () => {
      throw new Error("not configured");
    },
    runHealthCheck: async () => undefined,
    clearCaches: async () => undefined,
    logger: {
      info: () => undefined,
      error: () => undefined,
    },
    now: (() => {
      let current = 0;
      return () => {
        current += 10;
        return current;
      };
    })(),
  };
}

test("sync-all core returns 409 when the lock is already held", async () => {
  const response = await executeCatalogSyncAll({
    ...createBaseDeps(),
    acquireLock: async () => ({
      acquired: false,
      lockedUntil: "2026-03-06T09:00:00.000Z",
    }),
  });

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, {
    ok: false,
    error: "Catalog sync-all is already running.",
    code: "already_running",
    lock: {
      key: "catalog:sync-all",
      lockedUntil: "2026-03-06T09:00:00.000Z",
    },
  });
});

test("sync-all core returns 207 when only some sources fail", async () => {
  const response = await executeCatalogSyncAll({
    ...createBaseDeps(),
    runGithubSync: async () => ({
      created: 1,
      updated: 0,
      failed: 0,
      fetchedRecords: 1,
      fetchedPages: 1,
      candidates: 1,
      queuedForUpsert: 1,
      skippedManual: 0,
      skippedInvalid: 0,
      failures: [],
      changedSlugs: ["one"],
      staleCleanupEnabled: false,
      staleCleanupApplied: false,
      staleCappedCount: 0,
      staleCoverageRatio: null,
      minStaleBaselineRatio: 0.5,
      staleCleanupReason: null,
      staleBaselineCount: 0,
      maxStaleMarkRatio: 0,
      staleCandidates: 0,
      staleGraceMarked: 0,
      staleRejectedAfterGrace: 0,
    }),
    runSmitherySync: async () => {
      throw new Error("smithery unavailable");
    },
    runNpmSync: async () => ({
      created: 1,
      updated: 0,
      failed: 0,
      fetchedRecords: 1,
      fetchedPages: 1,
      candidates: 1,
      queuedForUpsert: 1,
      skippedManual: 0,
      skippedInvalid: 0,
      failures: [],
      changedSlugs: ["two"],
      staleCleanupEnabled: false,
      staleCleanupApplied: false,
      staleCappedCount: 0,
      staleCoverageRatio: null,
      minStaleBaselineRatio: 0.5,
      staleCleanupReason: null,
      staleBaselineCount: 0,
      maxStaleMarkRatio: 0,
      staleCandidates: 0,
      staleGraceMarked: 0,
      staleRejectedAfterGrace: 0,
    }),
  });

  assert.equal(response.status, 207);
  assert.equal(response.body.code, "partial_failure");
  assert.equal(response.body.error, "Catalog sync-all completed with partial source failures.");
});

test("sync-all core returns 500 when all sources fail", async () => {
  const response = await executeCatalogSyncAll({
    ...createBaseDeps(),
    runGithubSync: async () => {
      throw new Error("github failed");
    },
    runSmitherySync: async () => {
      throw new Error("smithery failed");
    },
    runNpmSync: async () => {
      throw new Error("npm failed");
    },
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.code, "internal_error");
  assert.equal(response.body.error, "Catalog sync-all failed across all sources.");
});
