import { expect, test, type Page } from "@playwright/test";

const routes = [
  "/",
  "/catalog",
  "/pricing",
  "/mcp",
  "/blog",
  "/about",
  "/contact",
  "/terms",
  "/submit-server",
  "/auth",
  "/server/demo-server",
] as const;

async function setLocaleCookies(page: Page) {
  await page.context().addCookies([
    { name: "demumumind_locale", value: "en", url: "http://127.0.0.1:3101" },
    { name: "demumumind_cookie_consent", value: "all", url: "http://127.0.0.1:3101" },
    { name: "demumumind_locale", value: "en", url: "http://localhost:3000" },
    { name: "demumumind_cookie_consent", value: "all", url: "http://localhost:3000" },
  ]);
}

test.describe("visual acceptance sweep", () => {
  for (const route of routes) {
    test(`desktop+mobile smoke: ${route}`, async ({ page }) => {
      await setLocaleCookies(page);

      await page.setViewportSize({ width: 1440, height: 960 });
      const desktopResp = await page.goto(route, { waitUntil: "networkidle" });
      expect(desktopResp?.ok()).toBeTruthy();
      const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(desktopOverflow).toBeFalsy();
      await expect(page).toHaveScreenshot(`visual-${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-desktop.png`, { fullPage: true });

      await page.setViewportSize({ width: 390, height: 844 });
      const mobileResp = await page.goto(route, { waitUntil: "networkidle" });
      expect(mobileResp?.ok()).toBeTruthy();
      const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(mobileOverflow).toBeFalsy();
      await expect(page).toHaveScreenshot(`visual-${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-mobile.png`, { fullPage: true });
    });
  }
});
