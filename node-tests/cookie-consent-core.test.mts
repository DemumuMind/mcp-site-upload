import assert from "node:assert/strict";
import test from "node:test";

import * as cookieConsentCoreModule from "../frontend/lib/cookie-consent-core.ts";

const {
  executeCookieConsentDelete,
  executeCookieConsentGet,
  executeCookieConsentPost,
  resolveConsentFromPayload,
} = cookieConsentCoreModule;

test("resolves consent from explicit profile", () => {
  assert.deepEqual(
    resolveConsentFromPayload({
      profile: {
        preferences: true,
        analytics: false,
      },
    }),
    {
      consent: "necessary",
      profile: {
        necessary: true,
        preferences: true,
        analytics: false,
      },
    },
  );
});

test("returns 400 on invalid JSON payload", async () => {
  const response = await executeCookieConsentPost(async () => {
    throw new Error("bad json");
  });

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      message: "Invalid JSON payload",
    },
  });
});

test("returns 400 on invalid consent payload", async () => {
  const response = await executeCookieConsentPost(async () => ({
    choice: "invalid-choice",
  }));

  assert.deepEqual(response, {
    status: 400,
    body: {
      ok: false,
      message: "Invalid consent payload",
    },
  });
});

test("reads consent state from cookies", () => {
  assert.deepEqual(
    executeCookieConsentGet({
      consentCookieValue: "all",
      profileCookieValue: undefined,
    }),
    {
      ok: true,
      consent: "all",
      profile: {
        necessary: true,
        preferences: true,
        analytics: true,
      },
    },
  );
});

test("returns cleared consent state on delete", () => {
  assert.deepEqual(executeCookieConsentDelete(), {
    ok: true,
    consent: null,
    profile: null,
  });
});
