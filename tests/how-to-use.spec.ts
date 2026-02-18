import { expect, test } from "@playwright/test";
import { setLocaleCookies } from "./helpers/locale-cookies";

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
