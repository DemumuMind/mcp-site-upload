"use client";

import { useEffect } from "react";

export function AuthHashRedirector() {
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const { pathname, hash } = window.location;
    if (!hash || !hash.includes("type=")) {
      return;
    }

    if (pathname === "/" && hash.includes("type=recovery")) {
      window.location.replace(`/auth/reset-password${hash}`);
      return;
    }

    if (pathname === "/" && hash.includes("type=signup")) {
      window.location.replace(`/auth${hash}`);
      return;
    }

    if (pathname === "/" && hash.includes("error_code=otp_expired")) {
      const hashParams = new URLSearchParams(hash.slice(1));
      const next = hashParams.get("next") ?? "/submit-server#submit";
      const error = hashParams.get("error") ?? "access_denied";
      const errorCode = hashParams.get("error_code") ?? "otp_expired";
      const errorDescription =
        hashParams.get("error_description") ?? "Email link is invalid or has expired";
      const redirectUrl = `/auth?next=${encodeURIComponent(next)}&error=${encodeURIComponent(error)}&error_code=${encodeURIComponent(errorCode)}&error_description=${encodeURIComponent(errorDescription)}`;
      window.location.replace(redirectUrl);
    }
  }, []);

  return null;
}
