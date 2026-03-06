import assert from "node:assert/strict";
import test from "node:test";

import * as demoCoreModule from "../frontend/lib/multi-agent/demo-core.ts";

const { executeMultiAgentDemo } = demoCoreModule;

function createBaseDeps() {
  return {
    requestId: "req-1",
    rateLimit: {
      allowed: true,
      resetAt: 0,
    },
    isAuthorized: true,
    parseJsonBody: async () => ({
      task: "Ship the feature",
      context: {},
    }),
    runPipeline: async () => ({
      result: { ok: true },
      log: [],
    }),
    persistTelemetry: async () => undefined,
    emitEvent: async () => undefined,
    logger: {
      warn: () => undefined,
      error: () => undefined,
    },
    now: (() => {
      let current = 1000;
      return () => {
        current += 10;
        return current;
      };
    })(),
  };
}

test("returns 401 for unauthorized requests", async () => {
  const response = await executeMultiAgentDemo({
    ...createBaseDeps(),
    isAuthorized: false,
  });

  assert.deepEqual(response, {
    status: 401,
    body: {
      ok: false,
      error: "Unauthorized",
      requestId: "req-1",
    },
  });
});

test("returns 429 when rate limited", async () => {
  const response = await executeMultiAgentDemo({
    ...createBaseDeps(),
    rateLimit: {
      allowed: false,
      resetAt: 2000,
    },
  });

  assert.deepEqual(response, {
    status: 429,
    body: {
      ok: false,
      error: "Too Many Requests",
      requestId: "req-1",
      retryAfterMs: 980,
    },
  });
});

test("returns 400 for invalid request payloads", async () => {
  const response = await executeMultiAgentDemo({
    ...createBaseDeps(),
    parseJsonBody: async () => ({
      task: "",
      context: {},
    }),
  });

  assert.equal(response.status, 400);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Invalid request body");
});

test("returns 500 for unhandled pipeline errors", async () => {
  const response = await executeMultiAgentDemo({
    ...createBaseDeps(),
    runPipeline: async () => {
      throw new Error("pipeline failed");
    },
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "pipeline failed",
      requestId: "req-1",
    },
  });
});
