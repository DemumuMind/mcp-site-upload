import { expect, test, type Page } from "@playwright/test";

const CORS_HEADERS = {
  "access-control-allow-origin": "*",
  "access-control-allow-methods": "GET,POST,OPTIONS",
  "access-control-allow-headers": "authorization,apikey,content-type,x-client-info",
};

async function forceEnglishLocale(page: Page) {
  await page.context().addCookies([
    {
      name: "demumumind_locale",
      value: "en",
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

    await forceEnglishLocale(page);
    await page.goto("/auth?next=%2Faccount");

    await expect(page.getByRole("button", { name: "No account? Sign up" })).toBeVisible();
    await page.getByRole("button", { name: "No account? Sign up" }).click();

    await expect(page.getByText("Register with email")).toBeVisible();
    await expect(page.getByText("At least 8 characters")).toBeVisible();
    await expect(page.getByText("At least one lowercase letter")).toBeVisible();
    await expect(page.getByText("At least one uppercase letter")).toBeVisible();
    await expect(page.getByText("At least one number")).toBeVisible();
    await expect(page.getByText("At least one symbol")).toBeVisible();

    await page.getByLabel("Email").fill("qa-signup@example.com");
    await page.getByLabel("Password").first().fill("Aa1!aaaa");
    await page.getByLabel("Confirm password").fill("Aa1!aaaa");

    await expect(page.getByText("Strong password")).toBeVisible();

    const signupRequest = page.waitForRequest(
      (request) => request.method() === "POST" && request.url().includes("/auth/v1/signup"),
    );
    await page.getByRole("button", { name: "Create account" }).click();
    await signupRequest;

    await expect(page).toHaveURL(/\/auth\/check-email\?.*flow=signup/);
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    await expect(
      page.getByText("We sent a confirmation link. Open it to finish account registration."),
    ).toBeVisible();

    await expect(page.getByRole("button", { name: "Resend confirmation email" })).toBeVisible();
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

    await forceEnglishLocale(page);
    await page.goto("/auth?next=%2Faccount");

    await expect(page.getByRole("button", { name: "Forgot password?" })).toBeVisible();
    await page.getByRole("button", { name: "Forgot password?" }).click();
    await expect(page.getByText("Password reset")).toBeVisible();

    await page.getByLabel("Email").fill("qa-reset@example.com");
    const resetRequest = page.waitForRequest(
      (request) => request.method() === "POST" && request.url().includes("/auth/v1/recover"),
    );
    await page.getByRole("button", { name: "Send reset email" }).click();
    await resetRequest;

    await expect(page).toHaveURL(/\/auth\/check-email\?.*flow=reset/);
    await expect(page.getByRole("heading", { name: "Check your email for reset link" })).toBeVisible();
    await expect(
      page.getByText("We sent a password reset link. Open it to set a new password."),
    ).toBeVisible();

    await expect(page.getByRole("button", { name: "Resend reset email" })).toBeVisible();
  });
});
