import { expect, test, type Page } from "@playwright/test";
import { setLocaleCookies } from "./helpers/locale-cookies";

async function getVisibleCardCount(page: Page): Promise<number> {
  return page.getByRole("link", { name: "View details" }).count();
}

test.describe("Catalog query v2 filters", () => {
  test("has no hydration mismatch errors in console on catalog page", async ({ page }) => {
    await setLocaleCookies(page, "en");
    const consoleErrors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") {
        consoleErrors.push(message.text());
      }
    });

    await page.goto("/catalog");
    await page.waitForTimeout(1200);

    const hydrationErrors = consoleErrors.filter((errorText) =>
      /(hydration|hydrated|didn't match|server rendered html didn't match)/i.test(errorText),
    );

    expect(hydrationErrors).toEqual([]);
  });

  test("preserves deep-link filter state and sort after reload", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog?query=github&auth=oauth&sortBy=name&sortDir=asc&pageSize=24&layout=list");

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
      "/catalog?sortBy=bad&page=-4&pageSize=13&layout=table&auth=foo&toolsMin=9&toolsMax=2&category=Search&category=Search",
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
    expect(parsed.searchParams.getAll("auth")).toHaveLength(0);
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

  test("applies quick filters and syncs URL chips", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog");

    await page.getByRole("button", { name: "Official only" }).click();
    await expect.poll(() => page.url()).toContain("verification=official");
    await expect(page.getByRole("button", { name: /Verification: Official/i })).toBeVisible();

    await page.getByRole("button", { name: "Healthy only" }).click();
    await expect.poll(() => page.url()).toContain("health=healthy");
    await expect(page.getByRole("button", { name: /Health: Healthy/i })).toBeVisible();

    await page.getByRole("button", { name: "No auth only" }).click();
    await expect.poll(() => page.url()).toContain("auth=none");
    await expect(page.getByRole("button", { name: /Auth: No auth/i })).toBeVisible();
  });

  test("catalog hero does not show github coverage metrics", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog");

    await expect(page.getByText("GitHub coverage")).toHaveCount(0);
    await expect(page.getByText("GitHub linked")).toHaveCount(0);
  });

  test("shows submit server CTA in result area", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog");

    const submitCta = page
      .getByText("Can't find your MCP server?")
      .locator("xpath=ancestor::div[1]")
      .getByRole("link", { name: "Submit server" })
      .first();
    await expect(submitCta).toBeVisible();
    await expect(submitCta).toHaveAttribute("href", "/submit-server");
  });

  test("renders logo image for every visible MCP card", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/catalog");

    const logoContainers = page.locator("div.size-18");
    const visibleCardCount = await logoContainers.count();
    expect(visibleCardCount).toBeGreaterThan(0);

    const cardLogoImages = page.locator('img[alt$=" logo"]');
    await expect(cardLogoImages).toHaveCount(visibleCardCount);
  });

  test("empty state offers reset and submit actions", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.route("**/api/catalog/search**", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          items: [],
          total: 0,
          page: 1,
          pageSize: 12,
          totalPages: 1,
          facets: {
            categoryEntries: [],
            tagEntries: [],
            authTypeCounts: { none: 0, oauth: 0, api_key: 0 },
            verificationCounts: { community: 0, partner: 0, official: 0 },
            healthCounts: { unknown: 0, healthy: 0, degraded: 0, down: 0 },
            toolsRange: { min: 0, max: 0 },
          },
          appliedFilters: {
            page: 1,
            pageSize: 12,
            query: "",
            categories: [],
            auth: [],
            tags: [],
            verification: [],
            health: [],
            toolsMin: null,
            toolsMax: null,
            sortBy: "rating",
            sortDir: "desc",
            layout: "grid",
          },
        }),
      });
    });
    await page.goto("/catalog");

    await expect(page.getByText("No tools found")).toBeVisible();
    await expect(page.getByRole("button", { name: "Reset all filters" })).toBeVisible();
    await expect(page.getByRole("link", { name: "Submit server" }).last()).toHaveAttribute("href", "/submit-server");
  });
});
