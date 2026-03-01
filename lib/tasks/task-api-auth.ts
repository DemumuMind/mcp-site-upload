import { timingSafeEqual } from "node:crypto";

const BEARER_PREFIX = "bearer ";

function getBearerTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const normalized = authHeader.trim();
  if (normalized.length <= BEARER_PREFIX.length) {
    return null;
  }

  if (normalized.slice(0, BEARER_PREFIX.length).toLowerCase() !== BEARER_PREFIX) {
    return null;
  }

  const token = normalized.slice(BEARER_PREFIX.length).trim();
  return token.length > 0 ? token : null;
}

function tokensMatch(expectedToken: string, actualToken: string): boolean {
  const expectedBytes = Buffer.from(expectedToken, "utf8");
  const actualBytes = Buffer.from(actualToken, "utf8");

  if (expectedBytes.length !== actualBytes.length) {
    return false;
  }

  return timingSafeEqual(expectedBytes, actualBytes);
}

export function authorizeTaskApiRequest(request: Request, envVarName = "TASKS_API_BEARER_TOKEN"): boolean {
  const expectedToken = process.env[envVarName];
  // Backward-compatible mode: auth is optional unless a token is configured.
  if (!expectedToken) {
    return true;
  }

  const providedToken = getBearerTokenFromRequest(request);
  if (!providedToken) {
    return false;
  }

  return tokensMatch(expectedToken, providedToken);
}
