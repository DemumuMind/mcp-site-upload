import { expect, test, type Page } from "@playwright/test";

async function setConsentCookies(page: Page) {
  const urls = ["http://127.0.0.1:3101", "http://localhost:3000"] as const;
  const cookies = urls.map((url) => ({
    name: "demumumind_cookie_consent",
    value: "all",
    url,
  }));

  await page.context().addCookies(cookies);
}

test.describe("Tools workbench", () => {
  test("estimates prompt tokens with model-aware calculator", async ({ page }) => {
    await setConsentCookies(page);
    await page.goto("/tools");

    await expect(page.getByText("LLM Token Calculator", { exact: true })).toBeVisible();

    await page.getByLabel("Prompt text").fill("Build a reliable MCP rules file for a Next.js monorepo.");

    await expect(page.getByText(/Estimated with .* tokenizer/)).toBeVisible();

    await page.getByRole("button", { name: "Clear" }).click();
    await expect(page.getByText("Start typing to estimate token usage.")).toBeVisible();
  });

  test("generates rules artifacts and supports presets", async ({ page }) => {
    await setConsentCookies(page);
    await page.goto("/tools");

    await expect(page.getByText("Rules Generator", { exact: true })).toBeVisible();

    await page.getByLabel("Project name").fill("DemumuMind MCP");
    await page
      .getByLabel("Project description")
      .fill("Next.js App Router project with strict lint/build gates and Playwright UI verification.");

    await page.getByPlaceholder("Next.js, TypeScript, Supabase...").fill("Next.js");
    await page.getByPlaceholder("Next.js, TypeScript, Supabase...").press("Enter");

    await page.getByPlaceholder("Strict lint, Playwright checks, no schema changes...").fill("Strict lint");
    await page.getByPlaceholder("Strict lint, Playwright checks, no schema changes...").press("Enter");

    await page.getByRole("button", { name: "Generate Rules" }).click();

    await expect(page.getByText("# AGENTS.md")).toBeVisible();

    await page.getByRole("button", { name: ".cursorrules" }).click();
    await expect(page.getByText("# .cursorrules")).toBeVisible();

    await page.getByRole("button", { name: "Copilot" }).click();
    await expect(page.getByText("# Copilot Instructions")).toBeVisible();

    await page.getByPlaceholder("Preset name").fill("default policy");
    await page.getByRole("button", { name: /^Save$/ }).first().click();
    await expect(page.getByText("default policy")).toBeVisible();
  });
});
