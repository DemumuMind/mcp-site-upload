import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  COOKIE_CONSENT_COOKIE_KEY,
  COOKIE_CONSENT_MAX_AGE_SECONDS,
  COOKIE_CONSENT_PROFILE_COOKIE_KEY,
  cookieConsentChoiceToProfile,
  cookieConsentProfileToChoice,
  parseCookieConsent,
  parseCookieConsentProfile,
  type CookieConsentChoice,
  type CookieConsentProfile,
} from "@/lib/cookie-consent";

export const dynamic = "force-dynamic";

type CookieConsentPayload = {
  choice?: string;
  profile?: Partial<CookieConsentProfile>;
};

function getCookieOptions(maxAgeSeconds: number) {
  return {
    path: "/",
    maxAge: maxAgeSeconds,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    httpOnly: false,
  };
}

function parseProfilePayload(value: unknown): CookieConsentProfile | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const candidate = value as Partial<CookieConsentProfile>;

  return {
    necessary: true,
    preferences: Boolean(candidate.preferences),
    analytics: Boolean(candidate.analytics),
  };
}

function resolveConsentFromPayload(payload: CookieConsentPayload | null) {
  const payloadChoice = parseCookieConsent(payload?.choice);
  const payloadProfile = parseProfilePayload(payload?.profile);

  if (!payloadChoice && !payloadProfile) {
    return null;
  }

  const profile = payloadProfile ?? cookieConsentChoiceToProfile(payloadChoice!);
  const consent = payloadChoice ?? cookieConsentProfileToChoice(profile);

  return { consent, profile };
}

export async function GET() {
  const cookieStore = await cookies();
  const consent = parseCookieConsent(cookieStore.get(COOKIE_CONSENT_COOKIE_KEY)?.value);
  const profile =
    parseCookieConsentProfile(cookieStore.get(COOKIE_CONSENT_PROFILE_COOKIE_KEY)?.value) ??
    (consent ? cookieConsentChoiceToProfile(consent) : null);

  return NextResponse.json({
    ok: true,
    consent,
    profile,
  });
}

export async function POST(request: Request) {
  let payload: CookieConsentPayload | null = null;
  try {
    payload = (await request.json()) as CookieConsentPayload;
  } catch {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid JSON payload",
      },
      { status: 400 },
    );
  }

  const resolved = resolveConsentFromPayload(payload);
  if (!resolved) {
    return NextResponse.json(
      {
        ok: false,
        message: "Invalid consent payload",
      },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    ok: true,
    consent: resolved.consent,
    profile: resolved.profile,
  });

  response.cookies.set(COOKIE_CONSENT_COOKIE_KEY, resolved.consent, getCookieOptions(COOKIE_CONSENT_MAX_AGE_SECONDS));
  response.cookies.set(
    COOKIE_CONSENT_PROFILE_COOKIE_KEY,
    JSON.stringify(resolved.profile),
    getCookieOptions(COOKIE_CONSENT_MAX_AGE_SECONDS),
  );

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({
    ok: true,
    consent: null as CookieConsentChoice | null,
    profile: null as CookieConsentProfile | null,
  });

  response.cookies.set(COOKIE_CONSENT_COOKIE_KEY, "", getCookieOptions(0));
  response.cookies.set(COOKIE_CONSENT_PROFILE_COOKIE_KEY, "", getCookieOptions(0));

  return response;
}
