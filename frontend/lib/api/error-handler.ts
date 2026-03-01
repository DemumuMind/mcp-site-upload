import { NextResponse } from "next/server";
import type { Logger } from "@/lib/api/logger";

export type ApiErrorResponse = {
  ok: false;
  error: string;
  details?: unknown;
};

export class ApiError extends Error {
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

function isZodError(error: unknown): error is { issues: unknown[]; name: string } {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    (error as { name: string }).name === "ZodError" &&
    "issues" in error
  );
}

export function handleApiError(
  error: unknown,
  logger?: Logger,
): NextResponse<ApiErrorResponse> {
  if (isZodError(error)) {
    const body: ApiErrorResponse = {
      ok: false,
      error: "Invalid request payload.",
      details: error.issues,
    };
    logger?.warn("validation_error", { issues: error.issues.length });
    return NextResponse.json(body, { status: 400 });
  }

  if (error instanceof ApiError) {
    const body: ApiErrorResponse = {
      ok: false,
      error: error.message,
      ...(error.details !== undefined ? { details: error.details } : {}),
    };
    logger?.error("api_error", {
      statusCode: error.statusCode,
      message: error.message,
    });
    return NextResponse.json(body, { status: error.statusCode });
  }

  const message = error instanceof Error ? error.message : "Unknown error";
  logger?.error("unhandled_error", { message });

  return NextResponse.json(
    { ok: false, error: "Internal server error" } satisfies ApiErrorResponse,
    { status: 500 },
  );
}
