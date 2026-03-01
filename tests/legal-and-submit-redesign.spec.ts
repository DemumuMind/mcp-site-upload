import { expect, test } from "@playwright/test";

test.describe("Redesigned company/legal and submit pages", () => {
  test("about, contact, terms, and sitemap pages render core sections", async ({ page }) => {
    await page.goto("/about");
    await expect(page.getByRole("heading", { name: "We build production MCP workflows, not demo theater." })).toBeVisible();

    await page.goto("/contact");
    await expect(page.getByRole("heading", { name: "Need help shipping MCP workflows?" })).toBeVisible();

    await page.goto("/terms");
    await expect(page.getByRole("heading", { name: "Terms of Service" })).toBeVisible();
    await expect(page.getByRole("link", { name: "13. Governing Law and Venue" })).toBeVisible();

    await page.goto("/sitemap");
    await expect(page.getByRole("heading", { name: "DemumuMind Sitemap" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Cookie Settings", exact: true }).first()).toBeVisible();
  });

  test("cookie settings page updates consent state labels", async ({ page }) => {
    await page.goto("/cookie-settings");
    await expect(page.getByRole("heading", { name: "Cookie Settings" })).toBeVisible();

    await page.getByRole("button", { name: "Use necessary only" }).click();
    await expect(page.getByText("Necessary cookies only", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Reset cookie preference" }).click();
    await expect(page.getByText("No preference saved yet")).toBeVisible();
  });

  test("submit server route requires auth and redirects to login", async ({ page }) => {
    await page.goto("/submit-server", { waitUntil: "networkidle" });
    await expect(page).toHaveURL(/\/auth\?next=%2Fsubmit-server/);
    const authDisabled = page.getByRole("heading", { name: "Auth is not configured" });
    if ((await authDisabled.count()) > 0) {
      await expect(authDisabled).toBeVisible();
      return;
    }
    await expect(page.getByLabel("Email")).toBeVisible();
  });
});
