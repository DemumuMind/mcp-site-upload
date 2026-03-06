import assert from "node:assert/strict";
import test from "node:test";
import { z } from "zod";

import * as routeCoreModule from "../frontend/lib/blog-v2/route-core.ts";

const { executeAdminJsonRoute } = routeCoreModule;

test("returns 400 on invalid JSON", async () => {
  const response = await executeAdminJsonRoute({
    parseJsonBody: async () => {
      throw new Error("invalid json");
    },
    schema: z.object({ title: z.string() }),
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid payload.",
    executionErrorMessage: "Run failed.",
    run: async () => ({ ok: true }),
    shapeSuccess: () => ({ actor: "admin" }),
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      message: "Invalid JSON payload.",
    },
  });
});

test("returns 422 on schema validation failures", async () => {
  const response = await executeAdminJsonRoute({
    parseJsonBody: async () => ({ title: "" }),
    schema: z.object({ title: z.string().min(1) }),
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid payload.",
    executionErrorMessage: "Run failed.",
    run: async () => ({ ok: true }),
    shapeSuccess: () => ({ actor: "admin" }),
  });

  assert.equal(response.status, 422);
  assert.equal(response.body.ok, false);
  assert.equal(response.body.message, "Invalid payload.");
});

test("returns 500 on execution failures", async () => {
  const response = await executeAdminJsonRoute({
    parseJsonBody: async () => ({ title: "ok" }),
    schema: z.object({ title: z.string().min(1) }),
    invalidJsonMessage: "Invalid JSON payload.",
    invalidPayloadMessage: "Invalid payload.",
    executionErrorMessage: "Run failed.",
    run: async () => {
      throw new Error("boom");
    },
    shapeSuccess: () => ({ actor: "admin" }),
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      message: "boom",
    },
  });
});
