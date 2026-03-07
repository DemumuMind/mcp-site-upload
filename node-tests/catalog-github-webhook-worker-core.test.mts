import assert from "node:assert/strict";
import test from "node:test";

import { executeCatalogGithubWebhookWorker } from "../frontend/lib/catalog/github-webhook-worker-core.ts";

function createBaseDeps() {
  return {
    lockKey: "catalog:sync-all",
    acquireLock: async () => ({ acquired: true }),
    startRun: async () => "run-1",
    finishRun: async () => undefined,
    recordFailures: async () => undefined,
    releaseLock: async () => undefined,
    getQueuedDeliveryCount: async () => 1,
    runSync: async () => ({
      executedAt: "2026-03-07T00:00:00.000Z",
      sourceTypes: ["github", "registry"],
      created: 1,
      updated: 0,
      published: 1,
      quarantined: 0,
      rejected: 0,
      failed: 0,
      changedSlugs: ["example-mcp"],
      failures: [],
      staleCandidates: 0,
      staleMarked: 0,
      staleRejectedAfterGrace: 0,
      staleCleanupApplied: false,
      staleCleanupReason: "GitHub stale cleanup skipped because discovery sweep is disabled for targeted processing.",
      sources: {
        github: {
          fetched: 1,
          normalized: 1,
          published: 1,
          quarantined: 0,
          rejected: 0,
          failed: 0,
          fullSweepCompleted: false,
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

test("github webhook worker returns no-op when queue is empty", async () => {
  const response = await executeCatalogGithubWebhookWorker({
    ...createBaseDeps(),
    getQueuedDeliveryCount: async () => 0,
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.skipped, true);
});

test("github webhook worker processes queued deliveries and returns changed slugs", async () => {
  const response = await executeCatalogGithubWebhookWorker(createBaseDeps());

  assert.equal(response.status, 200);
  assert.equal(response.body.processed, 1);
  assert.deepEqual(response.body.changedSlugs, ["example-mcp"]);
});
