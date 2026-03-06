import assert from "node:assert/strict";
import test from "node:test";

test("blog storage result explicit unavailable branch stays distinguishable", () => {
  const result = {
    ok: false,
    reason: "unavailable",
  } as const;

  assert.deepEqual(result, {
    ok: false,
    reason: "unavailable",
  });
});
