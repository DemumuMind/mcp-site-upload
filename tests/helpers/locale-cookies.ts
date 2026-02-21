import type { Page } from "@playwright/test";

function buildDefaultUrls(): string[] {
  const fallback = "http://127.0.0.1:3101";
  const base = process.env.PLAYWRIGHT_BASE_URL || fallback;

  try {
    const origin = new URL(base).origin;
    const urls = new Set<string>([origin]);

    if (origin.includes("127.0.0.1:3101")) {
      urls.add("http://localhost:3101");
      urls.add("http://localhost:3000");
    }
    if (origin.includes("localhost:3101")) {
      urls.add("http://127.0.0.1:3101");
      urls.add("http://localhost:3000");
    }

    return Array.from(urls);
  } catch {
    return [fallback, "http://localhost:3101", "http://localhost:3000"];
  }
}

const DEFAULT_URLS = buildDefaultUrls();

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
