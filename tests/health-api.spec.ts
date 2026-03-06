import { expect, test } from "@playwright/test";

test.describe("GET /api/health", () => {
  test("returns readiness payload", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({
      ok: true,
      readiness: "ready",
      liveness: "alive",
      planVersion: "v2",
    });
    expect(typeof body.checkedAt).toBe("string");
  });
});
