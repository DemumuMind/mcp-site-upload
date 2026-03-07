import {
  executeHealthCheck,
  type ActiveServerRow,
  type HealthProbe,
} from "@/lib/api/health-check-core";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const catalogHealthCheckConfig = {
  requestTimeoutMs: 6500,
  maxErrorLength: 240,
  maxProbeAttempts: 2,
  retryDelayMs: 500,
  probeConcurrency: 6,
  updateConcurrency: 10,
} as const;

export async function runFullHealthCheck() {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return undefined;
  }

  const response = await executeHealthCheck(catalogHealthCheckConfig, {
    getActiveServers: async () => {
      const { data, error } = await adminClient
        .from("servers")
        .select("id, name, server_url")
        .eq("status", "active")
        .range(0, 4999);

      if (error) {
        return {
          ok: false as const,
          error: error.message,
        };
      }

      return {
        ok: true as const,
        data: (data ?? []) as ActiveServerRow[],
      };
    },
    updateServer: async (probe: HealthProbe, checkedAt: string, sanitizedError: string | null) => {
      const { error } = await adminClient
        .from("servers")
        .update({
          health_status: probe.healthStatus,
          health_checked_at: checkedAt,
          health_error: sanitizedError,
        })
        .eq("id", probe.id);

      return error ? `${probe.id}:${error.message}` : null;
    },
  });

  return response.body;
}
