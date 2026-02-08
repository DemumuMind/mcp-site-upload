export const ADMIN_SESSION_COOKIE = "mcp_admin_session";

export function getAdminAccessToken(): string {
  return process.env.ADMIN_ACCESS_TOKEN || "local-admin-token";
}

export function isValidAdminToken(token: string): boolean {
  return token === getAdminAccessToken();
}

export function isAdminSessionCookieValue(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  return isValidAdminToken(value);
}
