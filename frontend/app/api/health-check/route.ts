import { NextResponse } from "next/server";
import { parseNumberEnv } from "@/lib/api/auth-helpers";
import { executeHealthCheck } from "@/lib/api/health-check-core";
import { withCronAuth } from "@/lib/api/with-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const DEFAULT_REQUEST_TIMEOUT_MS = 8000;
const DEFAULT_MAX_ERROR_LENGTH = 400;
const DEFAULT_MAX_PROBE_ATTEMPTS = 2;
const DEFAULT_RETRY_DELAY_MS = 400;
const DEFAULT_PROBE_CONCURRENCY = 5;
const DEFAULT_UPDATE_CONCURRENCY = 10;

const handlers = withCronAuth(
  async () => {
    const config = {
      requestTimeoutMs: parseNumberEnv("HEALTH_CHECK_REQUEST_TIMEOUT_MS", DEFAULT_REQUEST_TIMEOUT_MS, {
        min: 500,
        max: 60000,
      }),
      maxErrorLength: parseNumberEnv("HEALTH_CHECK_MAX_ERROR_LENGTH", DEFAULT_MAX_ERROR_LENGTH, {
        min: 50,
        max: 2000,
      }),
      maxProbeAttempts: parseNumberEnv("HEALTH_CHECK_MAX_PROBE_ATTEMPTS", DEFAULT_MAX_PROBE_ATTEMPTS, {
        min: 1,
        max: 5,
      }),
      retryDelayMs: parseNumberEnv("HEALTH_CHECK_RETRY_DELAY_MS", DEFAULT_RETRY_DELAY_MS, {
        min: 0,
        max: 10000,
      }),
      probeConcurrency: parseNumberEnv("HEALTH_CHECK_PROBE_CONCURRENCY", DEFAULT_PROBE_CONCURRENCY, {
        min: 1,
        max: 30,
      }),
      updateConcurrency: parseNumberEnv("HEALTH_CHECK_UPDATE_CONCURRENCY", DEFAULT_UPDATE_CONCURRENCY, {
        min: 1,
        max: 30,
      }),
    };

    const response = await executeHealthCheck(config, {
      getActiveServers: async () => {
        const supabaseAdminClient = createSupabaseAdminClient();
        if (!supabaseAdminClient) {
          return {
            ok: false as const,
            error:
              "Supabase admin credentials are not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.",
          };
        }

        const { data, error } = await supabaseAdminClient
          .from("servers")
          .select("id, name, server_url")
          .eq("status", "active");

        if (error) {
          return {
            ok: false as const,
            error: `Failed to query active servers: ${error.message}`,
          };
        }

        return {
          ok: true as const,
          data: (data ?? []) as {
            id: string;
            name: string;
            server_url: string | null;
          }[],
        };
      },
      updateServer: async (probe, checkedAt, sanitizedError) => {
        const supabaseAdminClient = createSupabaseAdminClient();
        if (!supabaseAdminClient) {
          return "Supabase admin credentials are not configured.";
        }

        const { error } = await supabaseAdminClient
          .from("servers")
          .update({
            health_status: probe.healthStatus,
            health_checked_at: checkedAt,
            health_error: sanitizedError,
          })
          .eq("id", probe.id);

        return error ? `${probe.name}: ${error.message}` : null;
      },
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["HEALTH_CHECK_CRON_SECRET", "CRON_SECRET"],
  "health_check",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
