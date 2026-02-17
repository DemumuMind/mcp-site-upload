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

test.describe("Homepage refactor", () => {
  test("renders catalog-first narrative with trust sections", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/");
    const main = page.getByRole("main");

    await expect(main.getByText("Community-Curated MCP Directory")).toBeVisible();
    await expect(main.getByRole("link", { name: "Start Exploring Servers" }).first()).toBeVisible();
    await expect(main.getByRole("link", { name: "Submit Your Server" }).first()).toBeVisible();

    await expect(main.getByRole("heading", { name: "MCP catalog at a glance" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "The MCP delivery workflow" })).toBeVisible();
    await expect(main.getByRole("heading", { name: "Trust signals before integration" })).toBeVisible();

    const featuredServersHeading = main.getByText("Featured servers", { exact: true });
    await expect(featuredServersHeading).toBeVisible();
    const featuredRows = page.locator("text=/Auth:\\s+(Open|OAuth|API Key)/");
    const emptyFallback = page.getByText("No featured servers yet.");

    await expect
      .poll(async () => (await featuredRows.count()) > 0 || (await emptyFallback.count()) > 0)
      .toBeTruthy();
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
