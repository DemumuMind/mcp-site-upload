import assert from "node:assert/strict";
import test from "node:test";

import * as serverProbeCoreModule from "../frontend/lib/server-probe-core.ts";

const { executeServerProbe, isUnsafeHost, resolvesToUnsafeAddress } = serverProbeCoreModule;

function createBaseDeps() {
  return {
    expectedProbeSecret: "secret",
    providedBearerToken: "secret",
    hasValidBearerToken: true,
    hasUiProbeHeader: false,
    slug: "server-slug",
    getServerBySlug: async () => ({ serverUrl: "https://example.com" }),
    fetchImpl: async () =>
      new Response("", {
        status: 200,
      }),
    dnsLookup: async () => [{ address: "93.184.216.34", family: 4 }],
    now: (() => {
      let current = 1000;
      return () => {
        current += 10;
        return current;
      };
    })(),
  };
}

test("detects unsafe hostnames", async () => {
  assert.equal(isUnsafeHost("localhost"), true);
  assert.equal(await resolvesToUnsafeAddress("127.0.0.1", async () => []), true);
});

test("returns 401 when secret is configured and auth is missing", async () => {
  const response = await executeServerProbe({
    ...createBaseDeps(),
    hasValidBearerToken: false,
    hasUiProbeHeader: false,
  });

  assert.deepEqual(response, {
    status: 401,
    body: {
      ok: false,
      error: "Unauthorized",
    },
  });
});

test("returns 400 for unsafe server hosts", async () => {
  const response = await executeServerProbe({
    ...createBaseDeps(),
    getServerBySlug: async () => ({ serverUrl: "http://localhost:3000" }),
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Unsafe server URL host",
    },
  });
});

test("returns 502 when fetch fails", async () => {
  const response = await executeServerProbe({
    ...createBaseDeps(),
    fetchImpl: async () => {
      throw new Error("Request failed");
    },
  });

  assert.equal(response.status, 502);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.error, "Request failed");
});
