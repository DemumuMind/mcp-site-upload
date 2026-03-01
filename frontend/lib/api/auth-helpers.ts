import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

function toBuffer(value: string): Buffer {
  return Buffer.from(value, "utf8");
}

function safeEqual(left: string, right: string): boolean {
  const leftBuffer = toBuffer(left);
  const rightBuffer = toBuffer(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token) {
    return null;
  }

  if (scheme.toLowerCase() !== "bearer") {
    return null;
  }

  const trimmed = token.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export function validateCronToken(providedToken: string, expectedToken: string): boolean {
  const provided = providedToken.trim();
  const expected = expectedToken.trim();
  if (!provided || !expected) {
    return false;
  }
  return safeEqual(provided, expected);
}

export function parseNumber(
  rawValue: string | null | undefined,
  fallbackValue: number,
  options?: { min?: number; max?: number },
): number {
  if (rawValue === null || rawValue === undefined) {
    return fallbackValue;
  }

  const parsed = Number.parseInt(rawValue.trim(), 10);
  if (!Number.isFinite(parsed)) {
    return fallbackValue;
  }

  const min = options?.min ?? Number.NEGATIVE_INFINITY;
  const max = options?.max ?? Number.POSITIVE_INFINITY;
  return Math.min(max, Math.max(min, parsed));
}

export function parseNumberEnv(
  envName: string,
  fallbackValue: number,
  options?: { min?: number; max?: number },
): number {
  return parseNumber(process.env[envName], fallbackValue, options);
}

export function csvEscape(value: string): string {
  if (value.length === 0) {
    return "\"\"";
  }

  const escaped = value.replace(/"/g, "\"\"");
  if (/[",\n\r]/.test(escaped)) {
    return `"${escaped}"`;
  }

  return escaped;
}
