import assert from "node:assert/strict";
import test from "node:test";

import * as clientErrorModule from "../frontend/components/catalog-section/catalog-search-client-error.ts";

const { getCatalogSearchClientError } = clientErrorModule;

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

  const error = await getCatalogSearchClientError(response);
  assert.deepEqual(error, {
    message: "Catalog search failed.",
    code: "internal_error",
  });
});

test("keeps invalid request errors distinct for frontend UX", async () => {
  const response = new Response(
    JSON.stringify({
      ok: false,
      error: "Invalid catalog search request.",
      code: "invalid_request",
    }),
    {
      status: 400,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );

  const error = await getCatalogSearchClientError(response);
  assert.deepEqual(error, {
    message: "Invalid catalog search request.",
    code: "invalid_request",
  });
});

test("falls back to the HTTP status when the response body is not the catalog error shape", async () => {
  const response = new Response(JSON.stringify({ message: "boom" }), {
    status: 500,
    headers: {
      "Content-Type": "application/json",
    },
  });

  const error = await getCatalogSearchClientError(response);
  assert.deepEqual(error, {
    message: "Failed to load catalog (500)",
    code: "unknown",
  });
});
