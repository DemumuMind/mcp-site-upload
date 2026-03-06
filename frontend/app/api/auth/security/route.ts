import { NextResponse, type NextRequest } from "next/server";
import { executeAuthSecurityRequest } from "@/lib/auth-security-core";
import { writeAuthSecurityLog } from "@/lib/auth-security-log";
import { sendSecurityAlertEmail } from "@/lib/email/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const LOGIN_WINDOW_SECONDS = 15 * 60;

function getClientIpAddress(request: NextRequest): string | null {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    const firstIp = forwardedFor.split(",")[0]?.trim();
    if (firstIp) {
      return firstIp;
    }
  }

  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || null;
}

async function getFailedAttemptsInWindow(
  emailHashValue: string,
  ipAddress: string | null,
): Promise<{ count: number; oldestCreatedAt: string | null }> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { count: 0, oldestCreatedAt: null };
  }

  const sinceIso = new Date(Date.now() - LOGIN_WINDOW_SECONDS * 1000).toISOString();

  const countQuery = adminClient
    .from("auth_security_events")
    .select("id", { count: "exact", head: true })
    .eq("event_type", "login_failure")
    .eq("email_hash", emailHashValue)
    .gte("created_at", sinceIso);
  const oldestQuery = adminClient
    .from("auth_security_events")
    .select("created_at")
    .eq("event_type", "login_failure")
    .eq("email_hash", emailHashValue)
    .gte("created_at", sinceIso)
    .order("created_at", { ascending: true })
    .limit(1);

  const scopedCountQuery = ipAddress ? countQuery.eq("ip_address", ipAddress) : countQuery;
  const scopedOldestQuery = ipAddress ? oldestQuery.eq("ip_address", ipAddress) : oldestQuery;

  const [countResult, oldestResult] = await Promise.all([scopedCountQuery, scopedOldestQuery]);

  return {
    count: countResult.count ?? 0,
    oldestCreatedAt: oldestResult.data?.[0]?.created_at ?? null,
  };
}

async function insertSecurityEvent(input: {
  eventType:
    | "login_success"
    | "login_failure"
    | "login_rate_limited"
    | "password_reset_request"
    | "password_reset_success"
    | "logout";
  email: string;
  emailHash: string;
  userId?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return;
  }

  await adminClient.from("auth_security_events").insert({
    event_type: input.eventType,
    user_id: input.userId ?? null,
    email: input.email || null,
    email_hash: input.emailHash || null,
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    metadata: input.metadata ?? {},
  });
  await writeAuthSecurityLog({
    eventType: input.eventType,
    email: input.email,
    userId: input.userId ?? null,
    ipAddress: input.ipAddress ?? null,
  });
}

async function hasDifferentKnownIp(input: { userId: string; ipAddress: string }): Promise<boolean> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return false;
  }

  const { data: previousSuccesses } = await adminClient
    .from("auth_security_events")
    .select("id, ip_address")
    .eq("event_type", "login_success")
    .eq("user_id", input.userId)
    .order("created_at", { ascending: false })
    .limit(20);

  return (previousSuccesses ?? []).some((row) => {
    const existingIp = typeof row.ip_address === "string" ? row.ip_address : null;
    return Boolean(existingIp) && existingIp !== input.ipAddress;
  });
}

export async function POST(request: NextRequest) {
  const response = await executeAuthSecurityRequest({
    parseJsonBody: () => request.json(),
    getClientIpAddress: () => getClientIpAddress(request),
    getUserAgent: () => request.headers.get("user-agent"),
    getFailedAttemptsInWindow,
    insertSecurityEvent,
    writeSecurityLog: writeAuthSecurityLog,
    hasDifferentKnownIp,
    sendSecurityAlertEmail: async (input) => {
      await sendSecurityAlertEmail(input);
    },
  });

  return NextResponse.json(response.body, { status: response.status });
}
