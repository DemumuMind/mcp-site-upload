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
    runSync: async () => {
      throw new Error("not configured");
    },
    runHealthCheck: async () => undefined,
    clearCaches: async () => undefined,
    logger: {
      info: () => undefined,
      warn: () => undefined,
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
    runSync: async () => ({
      executedAt: "2026-03-07T00:00:00.000Z",
      sourceTypes: ["github", "smithery", "npm"],
      created: 1,
      updated: 0,
      published: 1,
      quarantined: 0,
      rejected: 0,
      failed: 0,
      failures: [],
      changedSlugs: ["one"],
      staleCandidates: 0,
      staleMarked: 0,
      staleRejectedAfterGrace: 0,
      staleCleanupApplied: false,
      staleCleanupReason: null,
      sources: {
        github: {
          fetched: 1,
          normalized: 1,
          published: 1,
          quarantined: 0,
          rejected: 0,
          failed: 0,
          fullSweepCompleted: true,
        },
        smithery: {
          fetched: 0,
          normalized: 0,
          published: 0,
          quarantined: 0,
          rejected: 0,
          failed: 1,
          fullSweepCompleted: false,
        },
        npm: {
          fetched: 0,
          normalized: 0,
          published: 0,
          quarantined: 0,
          rejected: 0,
          failed: 0,
          fullSweepCompleted: true,
        },
      },
      metricsByStage: {
        fetched: 1,
        normalized: 1,
        verified: 1,
        published: 1,
        quarantined: 0,
        rejected: 0,
        stale: 0,
      },
    }),
  });

  assert.equal(response.status, 207);
  assert.equal(response.body.code, "partial_failure");
  assert.equal(response.body.error, "Catalog sync-all completed with partial source failures.");
});

test("sync-all core returns 500 when all sources fail", async () => {
  const response = await executeCatalogSyncAll({
    ...createBaseDeps(),
    runSync: async () => ({
      executedAt: "2026-03-07T00:00:00.000Z",
      sourceTypes: ["github", "smithery", "npm"],
      created: 0,
      updated: 0,
      published: 0,
      quarantined: 0,
      rejected: 0,
      failed: 3,
      failures: [
        { source: "github", entityKey: "github", stage: "fetch", reason: "github failed" },
        { source: "smithery", entityKey: "smithery", stage: "fetch", reason: "smithery failed" },
        { source: "npm", entityKey: "npm", stage: "fetch", reason: "npm failed" },
      ],
      changedSlugs: [],
      staleCandidates: 0,
      staleMarked: 0,
      staleRejectedAfterGrace: 0,
      staleCleanupApplied: false,
      staleCleanupReason: null,
      sources: {
        github: { fetched: 0, normalized: 0, published: 0, quarantined: 0, rejected: 0, failed: 1, fullSweepCompleted: false },
        smithery: { fetched: 0, normalized: 0, published: 0, quarantined: 0, rejected: 0, failed: 1, fullSweepCompleted: false },
        npm: { fetched: 0, normalized: 0, published: 0, quarantined: 0, rejected: 0, failed: 1, fullSweepCompleted: false },
      },
      metricsByStage: {
        fetched: 0,
        normalized: 0,
        verified: 0,
        published: 0,
        quarantined: 0,
        rejected: 0,
        stale: 0,
      },
    }),
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.code, "internal_error");
  assert.equal(response.body.error, "Catalog sync-all failed across all selected sources.");
});
