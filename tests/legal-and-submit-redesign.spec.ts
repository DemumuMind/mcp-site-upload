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
    await expect(page.getByText("Necessary cookies only")).toBeVisible();

    await page.getByRole("button", { name: "Reset cookie preference" }).click();
    await expect(page.getByText("No preference saved yet")).toBeVisible();
  });

  test("submit server uses 3-step guest-friendly wizard", async ({ page }) => {
    await page.goto("/submit-server");
    await expect(page.getByRole("heading", { name: "Submit your MCP server" })).toBeVisible();

    await page.getByLabel("Server name").fill("QA Wizard Server");
    await page.getByLabel("Category").fill("Automation");
    await page
      .getByLabel("Description")
      .fill("A test MCP server used to verify redesigned 3-step submission flow.");
    await page.getByRole("button", { name: "Continue" }).click();

    await page.getByLabel("Server URL").fill("https://example.com/mcp");
    await page.getByLabel("Maintainer name").fill("QA User");
    await page.getByLabel("Maintainer email").fill("qa@example.com");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("You can review everything now. Sign in is required only when you click final submit.")).toBeVisible();
    await expect(page.getByRole("button", { name: /Sign in and submit|Submit for moderation/ })).toBeVisible();
  });
});
