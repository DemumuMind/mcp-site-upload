import { expect, test, type Page } from "@playwright/test";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "authorization,apikey,content-type,x-client-info",
};

async function forceRussianLocale(page: Page) {
  await page.context().addCookies([
    {
      name: "demumumind_locale",
      value: "ru",
      url: "http://127.0.0.1:3101",
    },
  ]);
}

test.describe("Auth email flows", () => {
  test("sign-up shows password rules and redirects to check-email step", async ({ page }) => {
    await page.route("**/auth/v1/signup**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "content-type": "application/json",
        },
        body: JSON.stringify({
          user: {
            id: "00000000-0000-4000-8000-000000000001",
            aud: "authenticated",
            role: "authenticated",
            email: "qa-signup@example.com",
          },
          session: null,
        }),
      });
    });

    await page.route("**/auth/v1/resend**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });
    });

    await forceRussianLocale(page);
    await page.goto("/auth?next=%2Faccount");

    await expect(
      page.getByRole("button", {
        name: /Нет аккаунта\? Зарегистрироваться|No account\? Sign up/,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: /Нет аккаунта\? Зарегистрироваться|No account\? Sign up/,
      })
      .click();

    await expect(page.getByText(/Регистрация по email|Register with email/)).toBeVisible();
    await expect(page.getByText(/Минимум 8 символов|At least 8 characters/)).toBeVisible();
    await expect(
      page.getByText(/Хотя бы одна строчная буква|At least one lowercase letter/),
    ).toBeVisible();
    await expect(
      page.getByText(/Хотя бы одна заглавная буква|At least one uppercase letter/),
    ).toBeVisible();
    await expect(page.getByText(/Хотя бы одна цифра|At least one number/)).toBeVisible();
    await expect(page.getByText(/Хотя бы один спецсимвол|At least one symbol/)).toBeVisible();

    await page.getByLabel("Email").fill("qa-signup@example.com");
    await page.getByLabel(/Пароль|Password/).first().fill("Aa1!aaaa");
    await page.getByLabel(/Подтвердите пароль|Confirm password/).fill("Aa1!aaaa");

    await expect(page.getByText(/Сильный пароль|Strong password/)).toBeVisible();
    await expect(page.locator("ul").getByText("✓")).toHaveCount(5);

    const signupRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/auth/v1/signup"),
    );
    await page.getByRole("button", { name: /Создать аккаунт|Create account/ }).click();
    await signupRequest;

    await expect(page).toHaveURL(/\/auth\/check-email\?.*flow=signup/);
    await expect(page.getByRole("heading", { name: /Проверьте почту|Check your inbox/ })).toBeVisible();
    await expect(
      page.getByText(/Мы отправили ссылку подтверждения|We sent a confirmation link/),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Отправить письмо подтверждения повторно|Resend confirmation email/,
      }),
    ).toBeVisible();
  });

  test("reset request redirects to check-email step and supports resend", async ({ page }) => {
    await page.route("**/auth/v1/recover**", async (route) => {
      if (route.request().method() === "OPTIONS") {
        await route.fulfill({
          status: 200,
          headers: CORS_HEADERS,
        });
        return;
      }

      await route.fulfill({
        status: 200,
        headers: {
          ...CORS_HEADERS,
          "content-type": "application/json",
        },
        body: JSON.stringify({}),
      });
    });

    await forceRussianLocale(page);
    await page.goto("/auth?next=%2Faccount");

    await expect(
      page.getByRole("button", {
        name: /Забыли пароль\?|Forgot password\?/,
      }),
    ).toBeVisible();
    await page
      .getByRole("button", {
        name: /Забыли пароль\?|Forgot password\?/,
      })
      .click();
    await expect(page.getByText(/Сброс пароля|Password reset/)).toBeVisible();

    await page.getByLabel("Email").fill("qa-reset@example.com");
    const resetRequest = page.waitForRequest(
      (request) =>
        request.method() === "POST" &&
        request.url().includes("/auth/v1/recover"),
    );
    await page.getByRole("button", { name: /Отправить письмо для сброса|Send reset email/ }).click();
    await resetRequest;

    await expect(page).toHaveURL(/\/auth\/check-email\?.*flow=reset/);
    await expect(page.getByRole("heading", { name: /Проверьте письмо со ссылкой для сброса|Check your email for reset link/ })).toBeVisible();
    await expect(
      page.getByText(/Мы отправили ссылку для сброса пароля|We sent a password reset link/),
    ).toBeVisible();

    await expect(
      page.getByRole("button", {
        name: /Отправить письмо для сброса повторно|Resend reset email/,
      }),
    ).toBeVisible();
  });
});
