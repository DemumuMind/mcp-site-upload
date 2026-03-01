import { expect, test } from "@playwright/test";

const cronToken = process.env.CATALOG_AUTOSYNC_CRON_SECRET || process.env.CRON_SECRET;

test.describe("Catalog automation API", () => {
  test("GET /api/catalog/automation-status without token returns 401", async ({ request }) => {
    const response = await request.get("/api/catalog/automation-status");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("GET /api/catalog/automation-status auth behavior is correct", async ({ request }) => {
    const headers = cronToken
      ? {
          Authorization: `Bearer ${cronToken}`,
        }
      : undefined;

    const response = await request.get("/api/catalog/automation-status", { headers });
    const body = await response.json();

    if (!cronToken) {
      expect(response.status()).toBe(401);
      expect(body).toMatchObject({
        ok: false,
        error: "Unauthorized",
      });
      return;
    }

    expect(response.status()).toBe(200);
    expect(body).toMatchObject({
      ok: expect.any(Boolean),
      checks: expect.any(Object),
      catalogAutoSync: expect.any(Object),
      recentRuns: expect.any(Object),
      activeLocks: expect.any(Object),
    });
  });

  test("POST /api/catalog/auto-sync without token returns 401", async ({ request }) => {
    const response = await request.post("/api/catalog/auto-sync");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/catalog/sync-all without token returns 401", async ({ request }) => {
    const response = await request.post("/api/catalog/sync-all");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });
});
