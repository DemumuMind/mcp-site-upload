import assert from "node:assert/strict";
import test from "node:test";

import * as clientErrorModule from "../frontend/components/catalog-section/catalog-search-client-error.ts";

const { getCatalogSearchErrorMessage } = clientErrorModule;

test("uses the backend-provided message when the catalog API returns a known error code", async () => {
  const response = new Response(
    JSON.stringify({
      ok: false,
      error: "Catalog search failed.",
      code: "internal_error",
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const message = await getCatalogSearchErrorMessage(response);
  assert.equal(message, "Catalog search failed.");
});

test("falls back to the HTTP status when the response body is not the catalog error shape", async () => {
  const response = new Response(JSON.stringify({ message: "boom" }), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const message = await getCatalogSearchErrorMessage(response);
  assert.equal(message, "Failed to load catalog (500)");
});
