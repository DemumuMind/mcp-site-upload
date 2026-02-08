import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const DEFAULT_REQUEST_TIMEOUT_MS = 8_000;
const DEFAULT_MAX_ERROR_LENGTH = 400;
const DEFAULT_MAX_PROBE_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 400;
const DEFAULT_PROBE_CONCURRENCY = 5;
const DEFAULT_UPDATE_CONCURRENCY = 10;

type NumberEnvOptions = {
  min: number;
  max: number;
};

function parseNumberEnv(
  envName: string,
  fallbackValue: number,
  options: NumberEnvOptions,
): number {
  const rawValue = process.env[envName]?.trim();
  if (!rawValue) {
    return fallbackValue;
  }

  const parsedValue = Number.parseInt(rawValue, 10);
  if (!Number.isFinite(parsedValue)) {
    return fallbackValue;
  }

  if (parsedValue < options.min || parsedValue > options.max) {
    return fallbackValue;
  }

  return parsedValue;
}

const REQUEST_TIMEOUT_MS = parseNumberEnv(
  "HEALTH_CHECK_REQUEST_TIMEOUT_MS",
  DEFAULT_REQUEST_TIMEOUT_MS,
  { min: 500, max: 60_000 },
);

const MAX_ERROR_LENGTH = parseNumberEnv(
  "HEALTH_CHECK_MAX_ERROR_LENGTH",
  DEFAULT_MAX_ERROR_LENGTH,
  { min: 50, max: 2_000 },
);

const MAX_PROBE_ATTEMPTS = parseNumberEnv(
  "HEALTH_CHECK_MAX_PROBE_ATTEMPTS",
  DEFAULT_MAX_PROBE_ATTEMPTS,
  { min: 1, max: 5 },
);

const RETRY_DELAY_MS = parseNumberEnv(
  "HEALTH_CHECK_RETRY_DELAY_MS",
  DEFAULT_RETRY_DELAY_MS,
  { min: 0, max: 10_000 },
);

const PROBE_CONCURRENCY = parseNumberEnv(
  "HEALTH_CHECK_PROBE_CONCURRENCY",
  DEFAULT_PROBE_CONCURRENCY,
  { min: 1, max: 30 },
);

const UPDATE_CONCURRENCY = parseNumberEnv(
  "HEALTH_CHECK_UPDATE_CONCURRENCY",
  DEFAULT_UPDATE_CONCURRENCY,
  { min: 1, max: 30 },
);

type ActiveServerRow = {
  id: string;
  name: string;
  server_url: string | null;
};

type HealthProbe = {
  id: string;
  name: string;
  healthStatus: HealthStatus;
  healthError: string | null;
};

function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
}

function classifyHttpStatus(statusCode: number): HealthStatus {
  if (statusCode >= 200 && statusCode < 400) {
    return "healthy";
  }

  if (statusCode >= 400 && statusCode < 500) {
    return "degraded";
  }

  return "down";
}

function toErrorText(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return "Unknown probe error";
}

function isRetryableProbeError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  return error.name === "AbortError" || error.name === "TypeError";
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseServerUrl(rawUrl: string): URL | null {
  try {
    const parsed = new URL(rawUrl);

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

async function fetchProbe(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    return await fetch(url, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "demumumind-mcp-health-check/1.0",
      },
    });
  } finally {
    clearTimeout(timeoutHandle);
  }
}

async function mapWithConcurrency<TInput, TOutput>(
  items: readonly TInput[],
  concurrency: number,
  mapper: (item: TInput) => Promise<TOutput>,
): Promise<TOutput[]> {
  if (items.length === 0) {
    return [];
  }

  const boundedConcurrency = Math.max(1, Math.min(concurrency, items.length));
  const results = new Array<TOutput>(items.length);
  let nextIndex = 0;

  async function worker() {
    while (true) {
      const currentIndex = nextIndex;
      nextIndex += 1;

      if (currentIndex >= items.length) {
        return;
      }

      results[currentIndex] = await mapper(items[currentIndex]);
    }
  }

  await Promise.all(Array.from({ length: boundedConcurrency }, () => worker()));
  return results;
}

function sanitizeError(error: string | null): string | null {
  if (!error) {
    return null;
  }

  return error.length > MAX_ERROR_LENGTH ? error.slice(0, MAX_ERROR_LENGTH) : error;
}

function getExpectedCronToken(): string | null {
  return process.env.HEALTH_CHECK_CRON_SECRET || process.env.CRON_SECRET || null;
}

async function probeServer(row: ActiveServerRow): Promise<HealthProbe> {
  const serverUrl = row.server_url?.trim();

  if (!serverUrl) {
    return {
      id: row.id,
      name: row.name,
      healthStatus: "unknown",
      healthError: "Missing server URL",
    };
  }

  const parsedServerUrl = parseServerUrl(serverUrl);
  if (!parsedServerUrl) {
    return {
      id: row.id,
      name: row.name,
      healthStatus: "unknown",
      healthError: "Invalid server URL",
    };
  }

  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_PROBE_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetchProbe(parsedServerUrl.toString());

      if (response.ok) {
        return {
          id: row.id,
          name: row.name,
          healthStatus: classifyHttpStatus(response.status),
          healthError: null,
        };
      }

      const statusHealth = classifyHttpStatus(response.status);
      const statusError = `HTTP ${response.status}`;

      if (
        response.status >= 500 &&
        attempt < MAX_PROBE_ATTEMPTS
      ) {
        lastError = statusError;
        await delay(RETRY_DELAY_MS * attempt);
        continue;
      }

      return {
        id: row.id,
        name: row.name,
        healthStatus: statusHealth,
        healthError: statusError,
      };
    } catch (error) {
      lastError = toErrorText(error);

      if (attempt < MAX_PROBE_ATTEMPTS && isRetryableProbeError(error)) {
        await delay(RETRY_DELAY_MS * attempt);
        continue;
      }

      return {
        id: row.id,
        name: row.name,
        healthStatus: "unknown",
        healthError: lastError,
      };
    }
  }

  return {
    id: row.id,
    name: row.name,
    healthStatus: "unknown",
    healthError: lastError || "Unknown probe error",
  };
}

async function runHealthCheck(request: NextRequest) {
  const expectedToken = getExpectedCronToken();

  if (!expectedToken) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing cron secret. Set HEALTH_CHECK_CRON_SECRET or CRON_SECRET.",
      },
      { status: 500 },
    );
  }

  const providedToken = extractBearerToken(request);
  if (!providedToken || providedToken !== expectedToken) {
    return NextResponse.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdminClient = createSupabaseAdminClient();
  if (!supabaseAdminClient) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
      },
      { status: 500 },
    );
  }

  const { data, error } = await supabaseAdminClient
    .from("servers")
    .select("id, name, server_url")
    .eq("status", "active");

  if (error) {
    return NextResponse.json(
      { ok: false, message: `Failed to query active servers: ${error.message}` },
      { status: 500 },
    );
  }

  const activeServers = (data ?? []) as ActiveServerRow[];
  if (activeServers.length === 0) {
    return NextResponse.json({
      ok: true,
      checkedAt: new Date().toISOString(),
      total: 0,
      summary: { healthy: 0, degraded: 0, down: 0, unknown: 0 },
      updateErrors: [],
    });
  }

  const probeResults = await mapWithConcurrency(
    activeServers,
    PROBE_CONCURRENCY,
    async (row) => probeServer(row),
  );
  const checkedAt = new Date().toISOString();

  const summary: Record<HealthStatus, number> = {
    healthy: 0,
    degraded: 0,
    down: 0,
    unknown: 0,
  };

  for (const result of probeResults) {
    summary[result.healthStatus] += 1;
  }

  const updateErrors = (
    await mapWithConcurrency(
      probeResults,
      UPDATE_CONCURRENCY,
      async (result) => {
        const { error: updateError } = await supabaseAdminClient
          .from("servers")
          .update({
            health_status: result.healthStatus,
            health_checked_at: checkedAt,
            health_error: sanitizeError(result.healthError),
          })
          .eq("id", result.id);

        return updateError ? `${result.name}: ${updateError.message}` : null;
      },
    )
  ).filter((value): value is string => value !== null);

  return NextResponse.json({
    ok: updateErrors.length === 0,
    checkedAt,
    total: probeResults.length,
    summary,
    updateErrors,
  });
}

export async function GET(request: NextRequest) {
  return runHealthCheck(request);
}

export async function POST(request: NextRequest) {
  return runHealthCheck(request);
}
