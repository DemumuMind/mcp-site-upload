export type AuthCheckEmailFlow = "signup" | "reset";

export function normalizeInternalPath(nextPath: string | null | undefined): string {
  const candidate = nextPath?.trim();

  if (!candidate || !candidate.startsWith("/")) {
    return "/";
  }

  if (candidate.startsWith("//") || candidate.startsWith("/\\")) {
    return "/";
  }

  if (/[\u0000-\u001F\u007F]/.test(candidate)) {
    return "/";
  }

  try {
    const parsed = new URL(candidate, "http://localhost");

    if (parsed.origin !== "http://localhost") {
      return "/";
    }

    const normalizedPath = `${parsed.pathname}${parsed.search}${parsed.hash}`;
    if (!normalizedPath.startsWith("/") || normalizedPath.startsWith("//")) {
      return "/";
    }

    return normalizedPath;
  } catch {
    return "/";
  }
}

export function buildAuthCallbackRedirect(origin: string, nextPath: string): string {
  const safeNextPath = normalizeInternalPath(nextPath);
  return `${origin}/auth/callback?next=${encodeURIComponent(safeNextPath)}`;
}

export function buildResetPasswordRedirect(origin: string): string {
  return `${origin}/auth/reset-password`;
}

type BuildCheckEmailPathParams = {
  flow: AuthCheckEmailFlow;
  email: string;
  nextPath: string;
};

export function buildCheckEmailPath({
  flow,
  email,
  nextPath,
}: BuildCheckEmailPathParams): string {
  const searchParams = new URLSearchParams();
  searchParams.set("flow", flow);
  searchParams.set("email", email.trim());

  const safeNextPath = normalizeInternalPath(nextPath);
  if (safeNextPath !== "/") {
    searchParams.set("next", safeNextPath);
  }

  return `/auth/check-email?${searchParams.toString()}`;
}
