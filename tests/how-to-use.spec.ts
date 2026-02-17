import { expect, test, type Page } from "@playwright/test";

async function setLocaleCookies(page: Page, locale: "en") {
  const urls = ["http://127.0.0.1:3101", "http://localhost:3000"] as const;
  const cookies = urls.flatMap((url) => [
    {
      name: "demumumind_locale",
      value: locale,
      url,
    },
    {
      name: "demumumind_cookie_consent",
      value: "all",
      url,
    },
  ]);

  await page.context().addCookies(cookies);
}

test.describe("How-to-use page", () => {
  test("renders setup guide and key conversion paths", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/how-to-use");

    await expect(page.getByRole("heading", { name: /Setup Guide/i, level: 1 })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose your setup path", level: 2 })).toBeVisible();
    await expect(page.getByRole("button", { name: "Use this path" }).first()).toBeVisible();

    await page.getByRole("button", { name: "Claude Code" }).click();
    await expect(
      page.getByText("Add MCP server in local config, restart agent session, and re-open tool list."),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: /Open the Catalog|Open Catalog/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Choose a server in catalog|Review trusted servers/i }).first()).toBeVisible();
  });
});
