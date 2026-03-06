import { expect, test } from "@playwright/test";

test.describe("Blog automation API", () => {
  test("GET /api/blog/auto-publish without token returns 401", async ({ request }) => {
    const response = await request.get("/api/blog/auto-publish");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/blog/auto-publish without token returns 401", async ({ request }) => {
    const response = await request.post("/api/blog/auto-publish");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });
});
