import { NextResponse, type NextRequest } from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  getAdminRoleForUser,
  isAdminSessionCookieValue,
  isSupabaseAdminAuthEnabled,
  isTokenAdminAuthEnabled,
} from "@/lib/admin-auth";
import { checkRateLimit, RATE_LIMITS, type RateLimitConfig } from "@/lib/api/rate-limiter";
import { normalizeInternalPath } from "@/lib/auth-redirects";
import { createSupabaseProxyAuthClient } from "@/lib/supabase/proxy-auth";

const protectedUserPathnames = ["/account", "/submit-server"] as const;

function isProtectedUserPath(pathname: string): boolean {
  return protectedUserPathnames.some(
    (protectedPathname) =>
      pathname === protectedPathname || pathname.startsWith(`${protectedPathname}/`),
  );
}

function getAuthRedirectUrl(request: NextRequest): URL {
  const redirectUrl = new URL("/auth", request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;
  redirectUrl.searchParams.set("next", nextPath);
  return redirectUrl;
}

function getAdminLoginRedirectUrl(
  request: NextRequest,
  errorCode: "session" | "forbidden" | "config",
): URL {
  const redirectUrl = new URL("/admin/login", request.url);
  const nextPath = normalizeInternalPath(`${request.nextUrl.pathname}${request.nextUrl.search}`);
  redirectUrl.searchParams.set("redirect", nextPath);
  redirectUrl.searchParams.set("error", errorCode);
  return redirectUrl;
}

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) {
      return first;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp.trim();
  }

  return "unknown";
}

function resolveRateLimitConfig(pathname: string): RateLimitConfig {
  if (pathname.startsWith("/api/admin/")) {
    return RATE_LIMITS.admin;
  }

  const cronPaths = ["/api/catalog/auto-sync", "/api/blog/auto-publish", "/api/health-check"];
  if (cronPaths.some((p) => pathname.startsWith(p))) {
    return RATE_LIMITS.cron;
  }

  return RATE_LIMITS.public;
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    const ip = getClientIp(request);
    const config = resolveRateLimitConfig(pathname);
    const key = `${ip}:${pathname}`;
    const result = checkRateLimit(key, config);

    if (!result.allowed) {
      const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
      return NextResponse.json(
        { ok: false, error: "Too many requests" },
        {
          status: 429,
          headers: {
            "Retry-After": String(Math.max(1, retryAfter)),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Remaining", String(result.remaining));
    return response;
  }

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const tokenEnabled = isTokenAdminAuthEnabled();
    const supabaseEnabled = isSupabaseAdminAuthEnabled();
    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (tokenEnabled && isAdminSessionCookieValue(sessionCookie)) {
      return NextResponse.next();
    }

    if (supabaseEnabled) {
      const proxyClient = createSupabaseProxyAuthClient(request);

      if (!proxyClient) {
        if (!tokenEnabled) {
          return NextResponse.redirect(getAdminLoginRedirectUrl(request, "config"));
        }

        return NextResponse.redirect(getAdminLoginRedirectUrl(request, "session"));
      }

      const { data, error } = await proxyClient.supabaseClient.auth.getUser();

      if (!error && data.user) {
        const role = await getAdminRoleForUser(proxyClient.supabaseClient, data.user.id);

        if (role) {
          return proxyClient.getResponse();
        }

        return NextResponse.redirect(getAdminLoginRedirectUrl(request, "forbidden"));
      }
    }

    return NextResponse.redirect(getAdminLoginRedirectUrl(request, "session"));
  }

  if (!isProtectedUserPath(pathname)) {
    return NextResponse.next();
  }

  const authRedirectUrl = getAuthRedirectUrl(request);
  const proxyClient = createSupabaseProxyAuthClient(request);

  if (!proxyClient) {
    return NextResponse.redirect(authRedirectUrl);
  }

  const { data, error } = await proxyClient.supabaseClient.auth.getUser();

  if (error || !data.user) {
    return NextResponse.redirect(authRedirectUrl);
  }

  return proxyClient.getResponse();
}

export const config = {
  matcher: ["/api/:path*", "/admin/:path*", "/account/:path*", "/submit-server", "/submit-server/:path*"],
};
