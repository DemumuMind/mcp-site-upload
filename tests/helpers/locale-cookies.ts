import type { Page } from "@playwright/test";

const DEFAULT_URLS = ["http://127.0.0.1:3101", "http://localhost:3000"] as const;

export async function setLocaleCookies(page: Page, locale: "en", urls: readonly string[] = DEFAULT_URLS) {
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
