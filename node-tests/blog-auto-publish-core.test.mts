import assert from "node:assert/strict";
import test from "node:test";

import * as autoPublishCoreModule from "../frontend/lib/blog/auto-publish-core.ts";

const { executeBlogAutoPublish } = autoPublishCoreModule;

test("returns 409 when blog v2 is enabled", async () => {
  const response = await executeBlogAutoPublish({
    isBlogV2Enabled: () => true,
    parseCountFromQuery: () => null,
    parsePostsPerRunFromEnv: () => 1,
    parseRequestedCount: (_value, fallback) => fallback,
    parseRecencyDaysFromEnv: () => 14,
    parseMaxSourcesFromEnv: () => 6,
    runBatch: async () => {
      throw new Error("should not run");
    },
    clearCaches: async () => undefined,
  });

  assert.deepEqual(response, {
    status: 409,
    body: {
      ok: false,
      error:
        "Auto-publish v1 is disabled while BLOG_V2_ENABLED=true. Use /api/admin/blog-v2/* pipeline.",
      code: "disabled",
    },
  });
});

test("returns 207 when batch completes with failures", async () => {
  const response = await executeBlogAutoPublish({
    isBlogV2Enabled: () => false,
    parseCountFromQuery: () => null,
    parsePostsPerRunFromEnv: () => 1,
    parseRequestedCount: (_value, fallback) => fallback,
    parseRecencyDaysFromEnv: () => 14,
    parseMaxSourcesFromEnv: () => 6,
    runBatch: async () => ({
      executedAt: "2026-03-06T10:00:00.000Z",
      requestedCount: 1,
      createdCount: 0,
      failedCount: 1,
      created: [],
      failed: [{ topic: "topic", reason: "boom" }],
    }),
    clearCaches: async () => undefined,
  });

  assert.equal(response.status, 207);
  assert.equal(response.body.ok, false);
});

test("returns 500 on internal failures", async () => {
  const response = await executeBlogAutoPublish({
    isBlogV2Enabled: () => false,
    parseCountFromQuery: () => null,
    parsePostsPerRunFromEnv: () => 1,
    parseRequestedCount: (_value, fallback) => fallback,
    parseRecencyDaysFromEnv: () => 14,
    parseMaxSourcesFromEnv: () => 6,
    runBatch: async () => {
      throw new Error("boom");
    },
    clearCaches: async () => undefined,
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Blog auto-publish failed.",
      code: "internal_error",
    },
  });
});
