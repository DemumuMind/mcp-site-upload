import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { COOKIE_CONSENT_COOKIE_KEY, COOKIE_CONSENT_MAX_AGE_SECONDS, parseCookieConsent, type CookieConsentChoice } from "@/lib/cookie-consent";

export const dynamic = "force-dynamic";

type CookieConsentPayload = {
    choice?: string;
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

export async function GET() {
    const cookieStore = await cookies();
    const consent = parseCookieConsent(cookieStore.get(COOKIE_CONSENT_COOKIE_KEY)?.value);
    return NextResponse.json({
        ok: true,
        consent,
    });
}

export async function POST(request: Request) {
    let payload: CookieConsentPayload | null = null;
    try {
        payload = (await request.json()) as CookieConsentPayload;
    }
    catch {
        return NextResponse.json({
            ok: false,
            message: "Invalid JSON payload",
        }, { status: 400 });
    }

    const consent = parseCookieConsent(payload?.choice);
    if (!consent) {
        return NextResponse.json({
            ok: false,
            message: "Invalid consent choice",
        }, { status: 400 });
    }

    const response = NextResponse.json({
        ok: true,
        consent,
    });
    response.cookies.set(COOKIE_CONSENT_COOKIE_KEY, consent, getCookieOptions(COOKIE_CONSENT_MAX_AGE_SECONDS));
    return response;
}

export async function DELETE() {
    const response = NextResponse.json({
        ok: true,
        consent: null as CookieConsentChoice | null,
    });
    response.cookies.set(COOKIE_CONSENT_COOKIE_KEY, "", getCookieOptions(0));
    return response;
}
