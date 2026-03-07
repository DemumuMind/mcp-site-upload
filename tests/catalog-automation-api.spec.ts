import { expect, test } from "@playwright/test";
import { createHmac } from "node:crypto";

const cronToken = process.env.CATALOG_AUTOSYNC_CRON_SECRET || process.env.CRON_SECRET;
const githubWebhookSecret = process.env.GITHUB_WEBHOOK_SECRET;

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
    expect(typeof body.checkedAt).toBe("string");
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

  test("POST /api/catalog/smithery-sync without token returns 401", async ({ request }) => {
    const response = await request.post("/api/catalog/smithery-sync");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("GET /api/catalog/health-check without token returns 401", async ({ request }) => {
    const response = await request.get("/api/catalog/health-check");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/catalog/health-check without token returns 401", async ({ request }) => {
    const response = await request.post("/api/catalog/health-check");

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/catalog/cache-invalidate without token returns 401", async ({ request }) => {
    const response = await request.post("/api/catalog/cache-invalidate", {
      data: {
        changedSlugs: ["github"],
      },
    });

    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body).toMatchObject({ ok: false });
    expect(typeof body.error).toBe("string");
  });

  test("POST /api/catalog/github-webhook validates signature behavior", async ({ request }) => {
    const payload = JSON.stringify({
      repository: {
        full_name: "example/example-mcp",
        html_url: "https://github.com/example/example-mcp",
      },
    });

    if (!githubWebhookSecret) {
      const response = await request.post("/api/catalog/github-webhook", {
        headers: {
          "content-type": "application/json",
        },
        data: payload,
      });

      expect(response.status()).toBe(503);
      return;
    }

    const invalid = await request.post("/api/catalog/github-webhook", {
      headers: {
        "content-type": "application/json",
        "x-github-event": "push",
        "x-github-delivery": "delivery-invalid",
        "x-hub-signature-256": "sha256=invalid",
      },
      data: payload,
    });

    expect(invalid.status()).toBe(401);

    const signature = `sha256=${createHmac("sha256", githubWebhookSecret).update(payload).digest("hex")}`;
    const valid = await request.post("/api/catalog/github-webhook", {
      headers: {
        "content-type": "application/json",
        "x-github-event": "push",
        "x-github-delivery": `delivery-${Date.now()}`,
        "x-hub-signature-256": signature,
      },
      data: payload,
    });

    expect(valid.status()).toBe(202);
    const body = await valid.json();
    expect(body).toMatchObject({ ok: true, eventType: "push" });
  });
});
