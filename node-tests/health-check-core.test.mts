import assert from "node:assert/strict";
import test from "node:test";

import * as healthCheckCoreModule from "../frontend/lib/api/health-check-core.ts";

const { classifyHttpStatus, executeHealthCheck, isRestrictedIpAddress, parseServerUrl } = healthCheckCoreModule;

const config = {
  requestTimeoutMs: 1000,
  maxErrorLength: 100,
  maxProbeAttempts: 1,
  retryDelayMs: 0,
  probeConcurrency: 2,
  updateConcurrency: 2,
};

test("classifies HTTP status ranges deterministically", () => {
  assert.equal(classifyHttpStatus(200), "healthy");
  assert.equal(classifyHttpStatus(404), "degraded");
  assert.equal(classifyHttpStatus(503), "down");
});

test("rejects restricted IP addresses and unsafe URLs", () => {
  assert.equal(isRestrictedIpAddress("127.0.0.1"), true);
  assert.equal(isRestrictedIpAddress("10.0.0.1"), true);
  assert.equal(parseServerUrl("file:///etc/passwd"), null);
  assert.equal(parseServerUrl("https://user:pass@example.com"), null);
});

test("returns 500 when active server query fails", async () => {
  const response = await executeHealthCheck(config, {
    getActiveServers: async () => ({
      ok: false,
      error: "Failed to query active servers: boom",
    }),
    updateServer: async () => null,
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Failed to query active servers: boom",
    },
  });
});

test("returns empty success payload when there are no active servers", async () => {
  const response = await executeHealthCheck(config, {
    getActiveServers: async () => ({
      ok: true,
      data: [],
    }),
    updateServer: async () => null,
    nowIso: () => "2026-03-06T12:00:00.000Z",
  });

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      checkedAt: "2026-03-06T12:00:00.000Z",
      total: 0,
      summary: { healthy: 0, degraded: 0, down: 0, unknown: 0 },
      updateErrors: [],
    },
  });
});
