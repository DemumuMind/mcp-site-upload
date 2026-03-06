import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_CONSENT_COOKIE_KEY,
  COOKIE_CONSENT_MAX_AGE_SECONDS,
  COOKIE_CONSENT_PROFILE_COOKIE_KEY,
} from "@/lib/cookie-consent";
import {
  executeCookieConsentDelete,
  executeCookieConsentGet,
  executeCookieConsentPost,
} from "@/lib/cookie-consent-core";

export const dynamic = "force-dynamic";

function getCookieOptions(maxAgeSeconds: number) {
  return {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  };
}

export async function GET() {
  const cookieStore = await cookies();
  return NextResponse.json(
    executeCookieConsentGet({
      consentCookieValue: cookieStore.get(COOKIE_CONSENT_COOKIE_KEY)?.value,
      profileCookieValue: cookieStore.get(COOKIE_CONSENT_PROFILE_COOKIE_KEY)?.value,
    }),
  );
}

export async function POST(request: Request) {
  const result = await executeCookieConsentPost(() => request.json());
  if (result.status !== 200) {
    return NextResponse.json(result.body, { status: result.status });
  }

  const response = NextResponse.json(result.body);

  response.cookies.set(
    COOKIE_CONSENT_COOKIE_KEY,
    result.body.consent as string,
    getCookieOptions(COOKIE_CONSENT_MAX_AGE_SECONDS),
  );
  response.cookies.set(
    COOKIE_CONSENT_PROFILE_COOKIE_KEY,
    JSON.stringify(result.body.profile),
    getCookieOptions(COOKIE_CONSENT_MAX_AGE_SECONDS),
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json(executeCookieConsentDelete());

  response.cookies.set(COOKIE_CONSENT_COOKIE_KEY, "", getCookieOptions(0));
  response.cookies.set(COOKIE_CONSENT_PROFILE_COOKIE_KEY, "", getCookieOptions(0));

  return response;
}
