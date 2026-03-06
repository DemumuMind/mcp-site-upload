import assert from "node:assert/strict";
import test from "node:test";

import { classifyCatalogSearchError } from "../frontend/lib/catalog/search-route-error.ts";

test("maps ApiError-like request failures to a stable 4xx contract", () => {
  const response = classifyCatalogSearchError({
    message: "Invalid catalog search request.",
    statusCode: 400,
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Invalid catalog search request.",
      code: "invalid_request",
    },
  });
});

test("maps URI decoding failures to a stable 400 contract", () => {
  const response = classifyCatalogSearchError(new URIError("URI malformed"));

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      error: "Invalid catalog search request.",
      code: "invalid_request",
    },
  });
});

test("maps internal failures to a stable 500 contract", () => {
  const response = classifyCatalogSearchError(new Error("boom"));

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Catalog search failed.",
      code: "internal_error",
    },
  });
});
