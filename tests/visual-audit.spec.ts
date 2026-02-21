import { expect, test } from "@playwright/test";
import { setLocaleCookies } from "./helpers/locale-cookies";

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
] as const;

test.describe("visual acceptance sweep", () => {
  for (const route of routes) {
    test(`desktop+mobile smoke: ${route}`, async ({ page }) => {
      await setLocaleCookies(page, "en");

      await page.setViewportSize({ width: 1440, height: 960 });
      const desktopResp = await page.goto(route, { waitUntil: "networkidle" });
      expect(desktopResp?.ok()).toBeTruthy();
      if (route === "/") {
        await page.addStyleTag({
          content: [
            "[data-anime], [data-anime-stagger], .animate-spin, .animate-pulse {",
            "  animation: none !important;",
            "  transition: none !important;",
            "}",
          ].join("\n"),
        });
      }
      const desktopOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(desktopOverflow).toBeFalsy();
      const desktopMaxDiffPixels = route === "/" ? 30000 : 3500;
      await expect(page).toHaveScreenshot(`visual-${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-desktop.png`, {
        fullPage: true,
        maxDiffPixels: desktopMaxDiffPixels,
      });

      await page.setViewportSize({ width: 390, height: 844 });
      const mobileResp = await page.goto(route, { waitUntil: "networkidle" });
      expect(mobileResp?.ok()).toBeTruthy();
      if (route === "/") {
        await page.addStyleTag({
          content: [
            "[data-anime], [data-anime-stagger], .animate-spin, .animate-pulse {",
            "  animation: none !important;",
            "  transition: none !important;",
            "}",
          ].join("\n"),
        });
      }
      const mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
      expect(mobileOverflow).toBeFalsy();
      await expect(page).toHaveScreenshot(`visual-${route === "/" ? "home" : route.replace(/\//g, "_").replace(/^_/, "")}-mobile.png`, {
        fullPage: true,
        maxDiffPixels: 3500,
      });
    });
  }
});
