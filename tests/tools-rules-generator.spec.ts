import { expect, test, type Page } from "@playwright/test";

async function setLocaleCookies(page: Page, locale: "en" | "ru") {
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

test.describe("Tools rules generator", () => {
  test("generates multi-format rules in RU and supports merge mode", async ({ page }) => {
    await setLocaleCookies(page, "ru");
    await page.goto("/tools");

    await expect(page.getByText("Фирменный маскот")).toBeVisible();

    await page.getByRole("button", { name: "Merge с текущим AGENTS.md" }).click();
    await expect(page.getByLabel("Текущий AGENTS.md (опционально)")).toBeVisible();

    await page.getByLabel("Описание проекта").fill(
      "Next.js App Router проект с TypeScript, Supabase и обязательной Playwright-проверкой UI.",
    );

    await page.getByRole("button", { name: "Сгенерировать правила" }).click();

    await expect(page.getByRole("button", { name: "AGENTS.md", exact: true })).toBeVisible();
    await expect(page.getByRole("button", { name: ".cursorrules" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Инструкции Copilot" })).toBeVisible();
    await expect(page.getByText("# AGENTS.md")).toBeVisible();

    await page.getByRole("button", { name: ".cursorrules" }).click();
    await expect(page.getByText("# .cursorrules")).toBeVisible();

    await page.getByRole("button", { name: "Инструкции Copilot" }).click();
    await expect(page.getByText("# Copilot Instructions")).toBeVisible();
  });

  test("renders EN generator copy and can generate rules", async ({ page }) => {
    await setLocaleCookies(page, "en");
    await page.goto("/tools");

    await expect(page.getByText("Brand mascot")).toBeVisible();
    await expect(page.getByText("Rules Generator")).toBeVisible();

    await page.getByLabel("Project Description").fill(
      "MCP directory built on Next.js with strict lint/build verification and UI regression checks.",
    );

    await page.getByRole("button", { name: "Generate Rules" }).click();

    await expect(page.getByText("# AGENTS.md")).toBeVisible();
  });
});
