import { NextRequest, NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { HealthStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const REQUEST_TIMEOUT_MS = 8_000;
const MAX_ERROR_LENGTH = 400;

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

  const controller = new AbortController();
  const timeoutHandle = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(serverUrl, {
      method: "GET",
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "user-agent": "demumumind-mcp-health-check/1.0",
      },
    });

    if (response.ok) {
      return {
        id: row.id,
        name: row.name,
        healthStatus: classifyHttpStatus(response.status),
        healthError: null,
      };
    }

    return {
      id: row.id,
      name: row.name,
      healthStatus: classifyHttpStatus(response.status),
      healthError: `HTTP ${response.status}`,
    };
  } catch (error) {
    return {
      id: row.id,
      name: row.name,
      healthStatus: "down",
      healthError: toErrorText(error),
    };
  } finally {
    clearTimeout(timeoutHandle);
  }
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

  const probeResults = await Promise.all(activeServers.map((row) => probeServer(row)));
  const checkedAt = new Date().toISOString();

  const summary: Record<HealthStatus, number> = {
    healthy: 0,
    degraded: 0,
    down: 0,
    unknown: 0,
  };
  const updateErrors: string[] = [];

  for (const result of probeResults) {
    summary[result.healthStatus] += 1;

    const { error: updateError } = await supabaseAdminClient
      .from("servers")
      .update({
        health_status: result.healthStatus,
        health_checked_at: checkedAt,
        health_error: sanitizeError(result.healthError),
      })
      .eq("id", result.id);

    if (updateError) {
      updateErrors.push(`${result.name}: ${updateError.message}`);
    }
  }

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
