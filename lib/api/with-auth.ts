import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { extractBearerToken, validateCronToken } from "@/lib/api/auth-helpers";
import { getAdminAccessToken, isValidAdminToken } from "@/lib/admin-auth";

type Logger = {
  info: (event: string, payload?: Record<string, unknown>) => void;
  warn: (event: string, payload?: Record<string, unknown>) => void;
  error: (event: string, payload?: Record<string, unknown>) => void;
};

type HandlerContext = {
  logger: Logger;
};

type CronHandler = (request: NextRequest, context: HandlerContext) => Promise<Response>;
type AdminHandler = (request: NextRequest, context: HandlerContext) => Promise<Response>;

function createLogger(scope: string, requestId: string): Logger {
  function log(level: "info" | "warn" | "error", event: string, payload?: Record<string, unknown>) {
    const base = { scope, requestId, event, ...payload };
    if (level === "error") {
      console.error(base);
      return;
    }
    if (level === "warn") {
      console.warn(base);
      return;
    }
    console.log(base);
  }

  return {
    info: (event, payload) => log("info", event, payload),
    warn: (event, payload) => log("warn", event, payload),
    error: (event, payload) => log("error", event, payload),
  };
}

function getFirstConfiguredSecret(secretEnvNames: string[]): string | null {
  for (const envName of secretEnvNames) {
    const value = process.env[envName]?.trim();
    if (value) {
      return value;
    }
  }
  return null;
}

function unauthorizedResponse(message: string): NextResponse {
  return NextResponse.json({ ok: false, error: message }, { status: 401 });
}

export function withCronAuth(
  handler: CronHandler,
  secretEnvNames: string[] = ["CRON_SECRET"],
  scope = "cron",
): { GET: (request: NextRequest) => Promise<Response>; POST: (request: NextRequest) => Promise<Response> } {
  const run = async (request: NextRequest): Promise<Response> => {
    const requestId = randomUUID();
    const logger = createLogger(scope, requestId);
    const expectedToken = getFirstConfiguredSecret(secretEnvNames);

    if (!expectedToken) {
      logger.error("auth.missing_secret", { secretEnvNames });
      return unauthorizedResponse("Cron secret is not configured.");
    }

    const providedToken = extractBearerToken(request);
    if (!providedToken || !validateCronToken(providedToken, expectedToken)) {
      logger.warn("auth.invalid_token");
      return unauthorizedResponse("Unauthorized");
    }

    try {
      return await handler(request, { logger });
    } catch (error) {
      logger.error("handler.unhandled_error", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
  };

  return {
    GET: run,
    POST: run,
  };
}

export function withAdminAuth(
  handler: AdminHandler,
  scope = "admin",
): (request: NextRequest) => Promise<Response> {
  return async (request: NextRequest): Promise<Response> => {
    const requestId = randomUUID();
    const logger = createLogger(scope, requestId);

    const expectedToken = getAdminAccessToken();
    if (!expectedToken) {
      logger.error("auth.missing_admin_token");
      return unauthorizedResponse("Admin auth token is not configured.");
    }

    const providedToken = extractBearerToken(request);
    if (!providedToken || !isValidAdminToken(providedToken)) {
      logger.warn("auth.invalid_admin_token");
      return unauthorizedResponse("Unauthorized");
    }

    try {
      return await handler(request, { logger });
    } catch (error) {
      logger.error("handler.unhandled_error", {
        message: error instanceof Error ? error.message : "Unknown error",
      });
      return NextResponse.json({ ok: false, error: "Internal server error" }, { status: 500 });
    }
  };
}

