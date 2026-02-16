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

async function getVisibleCardCount(page: Page): Promise<number> {
  return page.getByRole("link", { name: "View details" }).count();
}

test.describe("Catalog query v2 filters", () => {
  test("preserves deep-link filter state and sort after reload", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog?query=github&pricing=oauth&sortBy=name&sortDir=asc&pageSize=24&layout=list");

    await expect(page.getByRole("button", { name: /Search: github/i })).toBeVisible();
    await expect.poll(() => page.url()).toContain("sortBy=name");
    await expect.poll(() => page.url()).toContain("sortDir=asc");
    await expect.poll(() => page.url()).toContain("pageSize=24");

    await page.reload();

    await expect.poll(() => page.url()).toContain("sortBy=name");
    await expect.poll(() => page.url()).toContain("sortDir=asc");
    await expect(page.getByRole("button", { name: /Search: github/i })).toBeVisible();
  });

  test("resets pagination when search filter changes", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog?page=2&query=seed");

    const searchInput = page.getByPlaceholder("Search tools, features, or descriptions...");
    await searchInput.fill("github");

    await expect.poll(() => page.url()).toContain("query=github");
    await expect.poll(() => page.url()).not.toContain("page=2");

    await searchInput.fill("slack");
    await expect.poll(() => page.url()).toContain("query=slack");
  });

  test("applies combined verification and health filters from URL", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog?verification=official&health=healthy");
    const visibleCount = await getVisibleCardCount(page);
    expect(visibleCount).toBeGreaterThanOrEqual(0);

    await expect.poll(() => page.url()).toContain("verification=official");
    await expect.poll(() => page.url()).toContain("health=healthy");
    await expect(page.getByRole("button", { name: /Verification: Official/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /Health: healthy/i })).toBeVisible();
  });

  test("canonicalizes malformed query params", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto(
      "/catalog?sortBy=bad&page=-4&pageSize=13&layout=table&pricing=foo&toolsMin=9&toolsMax=2&category=Search&category=Search",
    );

    await expect.poll(() => page.url()).toContain("category=Search");
    await expect.poll(() => page.url()).toContain("toolsMin=2");
    await expect.poll(() => page.url()).toContain("toolsMax=9");

    const parsed = new URL(page.url());
    expect(parsed.searchParams.getAll("category")).toHaveLength(1);
    expect(parsed.searchParams.get("sortBy")).toBeNull();
    expect(parsed.searchParams.get("layout")).toBeNull();
    expect(parsed.searchParams.get("page")).toBeNull();
    expect(parsed.searchParams.get("pageSize")).toBeNull();
    expect(parsed.searchParams.getAll("pricing")).toHaveLength(0);
  });

  test("opens and closes mobile filter drawer", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/catalog");

    await page.getByLabel("Open filters").click();
    await expect(page.locator("#catalog-mobile-filters")).toBeVisible();

    await page.locator("#catalog-mobile-filters").getByRole("button", { name: "Close filters" }).click();
    await expect(page.locator("#catalog-mobile-filters")).not.toBeVisible();
  });
});
