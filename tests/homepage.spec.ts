import { expect, test } from "@playwright/test";
import { setLocaleCookies } from "./helpers/locale-cookies";

test.describe("Homepage refactor", () => {
  test("renders catalog-first narrative with trust sections", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/");
    const main = page.getByRole("main");

    await expect(main.getByText("Community-Curated MCP Directory")).toBeVisible();
    await expect(main.getByRole("link", { name: "Start Exploring Servers" }).first()).toBeVisible();
    await expect(main.getByRole("link", { name: "Submit Your Server" }).first()).toBeVisible();

    await expect(main.getByText(/catalog/i).first()).toBeVisible();
    await expect(main.getByRole("heading", { name: /workflow/i })).toBeVisible();
    await expect(main.getByRole("heading", { name: /trust signals/i })).toBeVisible();

    const featuredServersHeading = main.getByText("Featured servers", { exact: true });
    await expect(featuredServersHeading).toBeVisible();
  });

  test("keeps mobile layout stable without horizontal overflow", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");

    await expect(page.getByText("Community-Curated MCP Directory", { exact: true }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: "Start Exploring Servers" }).first()).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      const root = document.documentElement;
      return root.scrollWidth > window.innerWidth + 1;
    });

    expect(hasHorizontalOverflow).toBeFalsy();
  });
});
