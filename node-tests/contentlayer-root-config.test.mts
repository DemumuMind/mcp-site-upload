import assert from "node:assert/strict";
import test from "node:test";

test("root contentlayer config resolves from repo root", async () => {
  const configModule = await import("../contentlayer.config.ts");

  assert.ok(configModule.default);
});
