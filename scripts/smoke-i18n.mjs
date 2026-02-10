#!/usr/bin/env node

import { chromium } from "@playwright/test";

const localeCookieName = "demumumind_locale";
const defaultBaseUrl = "http://localhost:3000";

const baseUrlInput =
  process.argv[2] || process.env.I18N_SMOKE_BASE_URL || process.env.NEXT_PUBLIC_SITE_URL || defaultBaseUrl;
const baseUrl = baseUrlInput.replace(/\/+$/, "");

const checks = [
  {
    route: "/",
    title: {
      en: "DemumuMind MCP",
      ru: "DemumuMind MCP",
    },
    h1: {
      en: "Ship MCP Integrations",
      ru: "Запускайте MCP-интеграции",
    },
  },
  {
    route: "/about",
    title: {
      en: "About",
      ru: "О нас",
    },
    h1: {
      en: "Agentic Engineering Organization",
      ru: "агенто-ориентированная инженерная организация",
    },
  },
  {
    route: "/categories",
    title: {
      en: "Categories",
      ru: "Категории",
    },
    h1: {
      en: "Categories",
      ru: "Категории",
    },
  },
  {
    route: "/catalog",
    title: {
      en: "AI Tools Directory",
      ru: "Каталог AI-инструментов",
    },
    h1: {
      en: "AI Tools Directory",
      ru: "Каталог AI-инструментов",
    },
  },
  {
    route: "/tools",
    title: {
      en: "Tools",
      ru: "Инструменты",
    },
    h1: {
      en: "Tools",
      ru: "Инструменты",
    },
  },
  {
    route: "/pricing",
    title: {
      en: "Pricing",
      ru: "Цены",
    },
    h1: {
      en: "Pricing",
      ru: "Цены",
    },
  },
  {
    route: "/contact",
    title: {
      en: "Contact",
      ru: "Контакты",
    },
    h1: {
      en: "Contact BridgeMind",
      ru: "Связаться с BridgeMind",
    },
  },
  {
    route: "/discord",
    title: {
      en: "Discord Community",
      ru: "Discord-сообщество",
    },
    h1: {
      en: "BridgeMind Discord",
      ru: "BridgeMind в Discord",
    },
  },
  {
    route: "/sitemap",
    title: {
      en: "Sitemap",
      ru: "Карта сайта",
    },
    h1: {
      en: "BridgeMind Sitemap",
      ru: "Карта сайта BridgeMind",
    },
  },
  {
    route: "/privacy",
    title: {
      en: "Privacy Policy",
      ru: "Политика конфиденциальности",
    },
    h1: {
      en: "Privacy Policy",
      ru: "Политика конфиденциальности",
    },
  },
  {
    route: "/terms",
    title: {
      en: "Terms of Service",
      ru: "Пользовательское соглашение",
    },
    h1: {
      en: "Terms of Service",
      ru: "Пользовательское соглашение",
    },
  },
];

function normalizeText(value) {
  return value.replace(/\s+/g, " ").trim();
}

const failures = [];

function logPass(message) {
  console.log(`PASS: ${message}`);
}

function logFail(message) {
  console.error(`FAIL: ${message}`);
  failures.push(message);
}

async function runLocaleChecks(browser, locale) {
  const context = await browser.newContext();
  await context.addCookies([
    {
      name: localeCookieName,
      value: locale,
      url: baseUrl,
      sameSite: "Lax",
    },
  ]);

  const page = await context.newPage();

  for (const check of checks) {
    const url = `${baseUrl}${check.route}`;

    try {
      const response = await page.goto(url, { waitUntil: "domcontentloaded" });
      const status = response?.status() ?? null;

      if (!status || status >= 400) {
        logFail(`[${locale}] ${check.route} returned status ${status ?? "unknown"}`);
        continue;
      }

      const title = await page.title();
      const expectedTitle = check.title[locale];

      if (!title.includes(expectedTitle)) {
        logFail(`[${locale}] ${check.route} title mismatch. Expected to include "${expectedTitle}", got "${title}"`);
      } else {
        logPass(`[${locale}] ${check.route} title`);
      }

      const h1Locator = page.locator("h1").first();
      const h1Raw = await h1Locator.innerText();
      const h1Text = normalizeText(h1Raw);
      const expectedH1 = check.h1[locale];

      if (!h1Text.includes(expectedH1)) {
        logFail(`[${locale}] ${check.route} h1 mismatch. Expected to include "${expectedH1}", got "${h1Text}"`);
      } else {
        logPass(`[${locale}] ${check.route} h1`);
      }
    } catch (error) {
      logFail(
        `[${locale}] ${check.route} request failed: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  await context.close();
}

async function main() {
  console.log(`Running i18n smoke checks against ${baseUrl}`);

  const browser = await chromium.launch({ headless: true });

  try {
    await runLocaleChecks(browser, "en");
    await runLocaleChecks(browser, "ru");
  } finally {
    await browser.close();
  }

  if (failures.length > 0) {
    console.error(`\nI18n smoke check failed (${failures.length} issue(s)).`);
    process.exit(1);
  }

  console.log("\nI18n smoke check passed.");
}

main().catch((error) => {
  console.error(`Unhandled i18n smoke-check error: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
