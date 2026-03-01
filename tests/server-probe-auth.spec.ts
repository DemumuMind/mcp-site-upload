import { expect, test } from "@playwright/test";

const probePath = "/api/server/non-existent-probe-slug/probe";

test.describe("Server probe auth contract", () => {
  test("keeps frontend same-origin probe working when bearer secret is enabled", async ({ page, request }) => {
    const hasProbeSecret = Boolean(process.env.SERVER_PROBE_SECRET?.trim());

    const directResponse = await request.post(probePath);
    if (hasProbeSecret) {
      expect(directResponse.status()).toBe(401);
    } else {
      expect(directResponse.status()).toBe(404);
    }

    await page.goto("/");
    const browserProbe = await page.evaluate(async (path) => {
      const response = await fetch(path, {
        method: "POST",
        headers: {
          "x-demumumind-probe-ui": "1",
        },
      });
      const body = (await response.json()) as { ok: boolean; error?: string };
      return {
        status: response.status,
        body,
      };
    }, probePath);

    expect(browserProbe.status).toBe(404);
    expect(browserProbe.body).toMatchObject({
      ok: false,
      error: "Server not found",
    });
  });
});
