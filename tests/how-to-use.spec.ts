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
  test("renders operations-first rollout guide and key conversion paths", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/how-to-use");

    await expect(
      page.getByRole("heading", { name: "MCP Setup Guide for Teams", level: 1 }),
    ).toBeVisible();
    await expect(page.getByRole("heading", { name: "Choose rollout track", level: 2 })).toBeVisible();

    const governedRolloutHeading = page.getByRole("heading", {
      name: "Governed rollout phases",
      level: 3,
    });

    await page.getByRole("button", { name: "Use this track" }).click();

    if (!(await governedRolloutHeading.isVisible())) {
      const retryButton = page.getByRole("button", { name: "Use this track" });
      if ((await retryButton.count()) > 0) {
        await retryButton.click();
      }
    }

    await expect(governedRolloutHeading).toBeVisible();
    await expect(page.getByText("Separate environment-specific access")).toBeVisible();

    await expect(page.getByRole("heading", { name: "Execution runbook", level: 3 })).toBeVisible();

    await page.getByRole("button", { name: "Claude Code" }).click();
    await expect(
      page.getByText(
        "Add server in local MCP config, restart session, and verify tool inventory refresh.",
      ),
    ).toBeVisible();

    await expect(page.getByRole("link", { name: "Open Catalog", exact: true })).toBeVisible();
    await expect(page.getByRole("link", { name: "Browse MCP servers" })).toBeVisible();
  });
});
