import { NextResponse, type NextRequest } from "next/server";

import { ADMIN_SESSION_COOKIE, isAdminSessionCookieValue } from "@/lib/admin-auth";
import { createSupabaseProxyAuthClient } from "@/lib/supabase/proxy-auth";

const protectedUserPathnames = ["/submit-server", "/account"] as const;

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

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") {
      return NextResponse.next();
    }

    const sessionCookie = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;

    if (!isAdminSessionCookieValue(sessionCookie)) {
      const loginUrl = new URL("/admin/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
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
  matcher: ["/admin/:path*", "/submit-server/:path*", "/account/:path*"],
};
