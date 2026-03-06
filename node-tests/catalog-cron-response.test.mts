import assert from "node:assert/strict";
import test from "node:test";

import * as cronResponseModule from "../frontend/lib/catalog/cron-route-response.ts";

const { createCatalogCronErrorBody, toCatalogCronErrorMessage } = cronResponseModule;

test("builds a stable cron error body with code", () => {
  assert.deepEqual(
    createCatalogCronErrorBody("Catalog sync-all is already running.", "already_running"),
    {
      ok: false,
      error: "Catalog sync-all is already running.",
      code: "already_running",
    },
  );
});

test("extracts message from unknown errors with a fallback", () => {
  assert.equal(toCatalogCronErrorMessage({ foo: "bar" }, "fallback message"), "fallback message");
});
