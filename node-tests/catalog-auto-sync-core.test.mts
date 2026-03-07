import assert from "node:assert/strict";
import test from "node:test";

import * as autoSyncCoreModule from "../frontend/lib/catalog/auto-sync-core.ts";

const { executeCatalogAutoSync } = autoSyncCoreModule;

function createBaseDeps() {
  return {
    requestPages: null,
    lockKey: "catalog:auto-sync",
    holderId: "holder-1",
    acquireLock: async () => ({ acquired: true }),
    startRun: async () => "run-1",
    finishRun: async () => undefined,
    recordFailures: async () => undefined,
    releaseLock: async () => undefined,
    parseEnvMaxPages: () => 120,
    parseMaxPages: (_value: string | null, fallback: number) => fallback,
    runSync: async () => {
      throw new Error("not configured");
    },
    clearCaches: async () => undefined,
    logger: {
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
    delay: async () => undefined,
    nodeEnv: "test",
  };
}

test("auto-sync core returns 409 when the lock is already held", async () => {
  const response = await executeCatalogAutoSync({
    ...createBaseDeps(),
    acquireLock: async () => ({
      acquired: false,
      lockedUntil: "2026-03-06T09:00:00.000Z",
    }),
  });

  assert.equal(response.status, 409);
  assert.deepEqual(response.body, {
    ok: false,
    error: "Catalog auto-sync is already running.",
    code: "already_running",
    lock: {
      key: "catalog:auto-sync",
      lockedUntil: "2026-03-06T09:00:00.000Z",
    },
  });
});

test("auto-sync core returns 207 partial failure on retryable network errors", async () => {
  const response = await executeCatalogAutoSync({
    ...createBaseDeps(),
    runSync: async () => {
      throw new Error("fetch failed");
    },
  });

  assert.equal(response.status, 207);
  assert.equal(response.body.code, "partial_failure");
  assert.equal(response.body.error, "Catalog auto-sync partially unavailable due to GitHub network failure.");
});

test("auto-sync core returns 500 on non-retryable internal errors", async () => {
  const response = await executeCatalogAutoSync({
    ...createBaseDeps(),
    runSync: async () => {
      throw new Error("schema mismatch");
    },
  });

  assert.equal(response.status, 500);
  assert.equal(response.body.code, "internal_error");
  assert.equal(response.body.error, "Catalog auto-sync failed before completion.");
});

test("auto-sync core forwards the created run id into the shared ingestion call", async () => {
  let observedRunId: string | null = null;

  const response = await executeCatalogAutoSync({
    ...createBaseDeps(),
    startRun: async () => "run-42",
    runSync: async ({ runId }) => {
      observedRunId = runId;
      return {
        executedAt: "2026-03-07T00:00:00.000Z",
        sourceTypes: ["github"],
        created: 0,
        updated: 0,
        published: 0,
        quarantined: 0,
        rejected: 0,
        failed: 0,
        changedSlugs: [],
        failures: [],
        staleCandidates: 0,
        staleMarked: 0,
        staleRejectedAfterGrace: 0,
        staleCleanupApplied: false,
        staleCleanupReason: "GitHub stale cleanup skipped because the search window did not exhaust all matching pages.",
        sources: {
          github: {
            fetched: 1,
            normalized: 1,
            published: 0,
            quarantined: 0,
            rejected: 0,
            failed: 0,
            fullSweepCompleted: false,
          },
        },
        metricsByStage: {
          fetched: 1,
          normalized: 1,
          verified: 0,
          published: 0,
          quarantined: 0,
          rejected: 0,
          stale: 0,
        },
      };
    },
  });

  assert.equal(response.status, 200);
  assert.equal(observedRunId, "run-42");
});
