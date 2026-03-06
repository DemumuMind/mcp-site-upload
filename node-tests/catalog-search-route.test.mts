import assert from "node:assert/strict";
import test from "node:test";

import * as routeCoreModule from "../frontend/lib/catalog/search-route-core.ts";

const { executeCatalogSearchRequest } = routeCoreModule;

test("returns 200 with the catalog search payload on the happy path", async () => {
  const response = await executeCatalogSearchRequest(new URLSearchParams("query=github"), {
    parseQuery: () => ({ query: "github" }),
    getSnapshot: async () => ({
      servers: [{ id: "server-1" }],
    }),
    runSearch: () => ({
      items: [{ id: "server-1" }],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      facets: {},
      appliedFilters: { query: "github" },
    }),
  });

  assert.deepEqual(response, {
    status: 200,
    body: {
      items: [{ id: "server-1" }],
      total: 1,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      facets: {},
      appliedFilters: { query: "github" },
    },
  });
});

test("maps ApiError-like request failures to a stable 4xx contract", async () => {
  const response = await executeCatalogSearchRequest(new URLSearchParams(), {
    parseQuery: () => {
      throw {
        message: "Invalid catalog search request.",
        statusCode: 400,
      };
    },
    getSnapshot: async () => ({ servers: [] }),
    runSearch: () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      facets: {},
      appliedFilters: {},
    }),
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

test("maps internal failures to a stable 500 contract", async () => {
  const response = await executeCatalogSearchRequest(new URLSearchParams(), {
    parseQuery: () => ({}),
    getSnapshot: async () => {
      throw new Error("boom");
    },
    runSearch: () => ({
      items: [],
      total: 0,
      page: 1,
      pageSize: 12,
      totalPages: 1,
      facets: {},
      appliedFilters: {},
    }),
  });

  assert.deepEqual(response, {
    status: 500,
    body: {
      ok: false,
      error: "Catalog search failed.",
      code: "internal_error",
    },
  });
});
