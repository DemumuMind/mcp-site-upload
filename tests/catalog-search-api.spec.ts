import { expect, test } from "@playwright/test";

test.describe("Catalog search API", () => {
  test("GET /api/catalog/search returns 200 with stable shape and no-store cache headers", async ({ request }) => {
    const response = await request.get("/api/catalog/search");

    expect(response.status()).toBe(200);
    expect(response.headers()["cache-control"]).toBe("no-store, no-cache, must-revalidate");

    const body = await response.json();
    expect(body).toMatchObject({
      items: expect.any(Array),
      total: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalPages: expect.any(Number),
      facets: expect.any(Object),
      appliedFilters: expect.any(Object),
    });
  });

  test("GET /api/catalog/search preserves repeated auth params in the normalized payload", async ({ request }) => {
    const response = await request.get("/api/catalog/search?auth=none&auth=oauth");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.appliedFilters?.auth).toEqual(["none", "oauth"]);
  });

  test("GET /api/catalog/search tolerates malformed percent-encoded query values without crashing", async ({ request }) => {
    const response = await request.get("/api/catalog/search?query=%E0%A4%A");

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toMatchObject({
      items: expect.any(Array),
      appliedFilters: expect.objectContaining({
        query: expect.any(String),
      }),
    });
  });
});
