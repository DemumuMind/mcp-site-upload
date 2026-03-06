import assert from "node:assert/strict";
import test from "node:test";

import * as authSecurityCoreModule from "../frontend/lib/auth-security-core.ts";

const { executeAuthSecurityRequest, hashEmail, normalizeEmail } = authSecurityCoreModule;

function createBaseDeps() {
  return {
    parseJsonBody: async () => ({ action: "precheck", email: "user@example.com" }),
    getClientIpAddress: () => "203.0.113.10",
    getUserAgent: () => "test-agent",
    getFailedAttemptsInWindow: async () => ({ count: 0, oldestCreatedAt: null }),
    insertSecurityEvent: async () => undefined,
    writeSecurityLog: async () => undefined,
    hasDifferentKnownIp: async () => false,
    sendSecurityAlertEmail: async () => undefined,
    now: () => Date.parse("2026-03-06T12:00:00.000Z"),
  };
}

test("normalizes and hashes emails deterministically", () => {
  assert.equal(normalizeEmail(" User@Example.com "), "user@example.com");
  assert.equal(
    hashEmail("user@example.com"),
    "b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514",
  );
});

test("returns 400 on invalid JSON payloads", async () => {
  const response = await executeAuthSecurityRequest({
    ...createBaseDeps(),
    parseJsonBody: async () => {
      throw new Error("invalid json");
    },
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Invalid JSON payload.",
    },
  });
});

test("blocks precheck after too many failed attempts", async () => {
  const response = await executeAuthSecurityRequest({
    ...createBaseDeps(),
    getFailedAttemptsInWindow: async () => ({
      count: 5,
      oldestCreatedAt: "2026-03-06T11:50:00.000Z",
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.retryAfterSeconds, 300);
});

test("returns 400 for unsupported actions", async () => {
  const response = await executeAuthSecurityRequest({
    ...createBaseDeps(),
    parseJsonBody: async () => ({ action: "unknown", email: "user@example.com" }),
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Unsupported action.",
    },
  });
});

test("returns alert metadata after repeated failed logins", async () => {
  const response = await executeAuthSecurityRequest({
    ...createBaseDeps(),
    parseJsonBody: async () => ({
      action: "login-result",
      email: "user@example.com",
      success: false,
    }),
    getFailedAttemptsInWindow: async () => ({
      count: 3,
      oldestCreatedAt: "2026-03-06T11:55:00.000Z",
    }),
  });

  assert.deepEqual(response, {
    status: 200,
    body: {
      ok: true,
      alert: {
        type: "failed_attempts",
        failedAttemptsInWindow: 3,
        windowSeconds: 900,
        threshold: 3,
      },
    },
  });
});
