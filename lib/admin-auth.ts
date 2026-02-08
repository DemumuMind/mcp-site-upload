export const ADMIN_SESSION_COOKIE = "mcp_admin_session";

export function getAdminAccessToken(): string {
  const envToken = process.env.ADMIN_ACCESS_TOKEN?.trim();

  if (envToken) {
    return envToken;
  }

  if (process.env.NODE_ENV !== "production") {
    return "local-admin-token";
  }

  return "";
}

export function isValidAdminToken(token: string): boolean {
  const expectedToken = getAdminAccessToken();

  if (!expectedToken) {
    return false;
  }

  return token === expectedToken;
}

export function isAdminSessionCookieValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return isValidAdminToken(value);
}
