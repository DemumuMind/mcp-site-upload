import { expect, test, type Page } from "@playwright/test";

async function setConsentCookies(page: Page) {
  const urls = ["http://127.0.0.1:3101", "http://localhost:3000"] as const;
  await page.context().addCookies(
    urls.flatMap((url) => [
      {
        name: "demumumind_locale",
        value: "en",
        url,
      },
      {
        name: "demumumind_cookie_consent",
        value: "all",
        url,
      },
    ]),
  );
}

test.describe("Blog v2", () => {
  test("renders editorial list page and featured article", async ({ page }) => {
    await setConsentCookies(page);
    await page.goto("/blog");

    await expect(page.getByRole("heading", { name: /DemumuMind Blog|BridgeMind Blog/i })).toBeVisible();
    await expect(page.getByText("Featured article")).toBeVisible();
    await expect(page.getByRole("link", { name: "Open article" })).toBeVisible();
  });

  test("applies topic filter in URL", async ({ page }) => {
    await setConsentCookies(page);
    await page.goto("/blog");

    await page.locator('a[href*="topic=workflow"]').first().click();
    await expect.poll(() => page.url()).toContain("topic=workflow");
    await expect(page.getByText("Topic: Workflow")).toBeVisible();
  });

  test("renders article page with related reading", async ({ page }) => {
    await setConsentCookies(page);
    await page.goto("/blog/mcp-setup-playbook-production-teams");

    await expect(page.getByRole("heading", { level: 1 })).toContainText(
      "MCP Setup Playbook for Production Teams",
    );
    await expect(page.getByRole("heading", { name: "Continue the conversation" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Back to blog" })).toBeVisible();
  });
});
