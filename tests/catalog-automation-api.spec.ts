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

  test("GET /api/catalog/automation-status with token returns 200 and status shape", async ({ request }) => {
    if (!cronToken) {
      const unauthorized = await request.get("/api/catalog/automation-status");
      expect(unauthorized.status()).toBe(401);
      const body = await unauthorized.json();
      expect(body).toMatchObject({ ok: false });
      expect(typeof body.error).toBe("string");
      return;
    }

    const response = await request.get("/api/catalog/automation-status", {
      headers: {
        Authorization: `Bearer ${cronToken}`,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
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
