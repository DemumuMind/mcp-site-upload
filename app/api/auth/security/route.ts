import { createHash } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { writeAuthSecurityLog } from "@/lib/auth-security-log";
import { sendSecurityAlertEmail } from "@/lib/email/notifications";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const LOGIN_WINDOW_SECONDS = 15 * 60;
const MAX_FAILED_ATTEMPTS = 5;
const ALERT_FAILED_ATTEMPTS = 3;
const ALERT_FAILED_ATTEMPTS_MAX = 5;

type PrecheckPayload = {
  action: "precheck";
  email?: string;
};

type LoginResultPayload = {
  action: "login-result";
  email?: string;
  success?: boolean;
  userId?: string | null;
  reason?: string;
};

type SecurityPayload = PrecheckPayload | LoginResultPayload;

function normalizeEmail(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

function hashEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

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
  emailHash: string,
): Promise<{ count: number; oldestCreatedAt: string | null }> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { count: 0, oldestCreatedAt: null };
  }

  const sinceIso = new Date(Date.now() - LOGIN_WINDOW_SECONDS * 1000).toISOString();

  const [countResult, oldestResult] = await Promise.all([
    adminClient
      .from("auth_security_events")
      .select("id", { count: "exact", head: true })
      .eq("event_type", "login_failure")
      .eq("email_hash", emailHash)
      .gte("created_at", sinceIso),
    adminClient
      .from("auth_security_events")
      .select("created_at")
      .eq("event_type", "login_failure")
      .eq("email_hash", emailHash)
      .gte("created_at", sinceIso)
      .order("created_at", { ascending: true })
      .limit(1),
  ]);

  const oldestCreatedAt = oldestResult.data?.[0]?.created_at ?? null;
  return {
    count: countResult.count ?? 0,
    oldestCreatedAt,
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

export async function POST(request: NextRequest) {
  let payload: SecurityPayload;
  try {
    payload = (await request.json()) as SecurityPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload." }, { status: 400 });
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    return NextResponse.json({ error: "Email is required." }, { status: 400 });
  }

  const emailHash = hashEmail(email);
  const ipAddress = getClientIpAddress(request);
  const userAgent = request.headers.get("user-agent");

  if (payload.action === "precheck") {
    const { count, oldestCreatedAt } = await getFailedAttemptsInWindow(emailHash);
    const hasLimit = count >= MAX_FAILED_ATTEMPTS;

    let retryAfterSeconds = 0;
    if (hasLimit && oldestCreatedAt) {
      const elapsedSeconds = Math.floor((Date.now() - new Date(oldestCreatedAt).getTime()) / 1000);
      retryAfterSeconds = Math.max(0, LOGIN_WINDOW_SECONDS - elapsedSeconds);
    }

    if (hasLimit) {
      await insertSecurityEvent({
        eventType: "login_rate_limited",
        email,
        emailHash,
        ipAddress,
        userAgent,
        metadata: { failedAttemptsInWindow: count, retryAfterSeconds },
      });
      await writeAuthSecurityLog({
        eventType: "precheck_blocked",
        email,
        ipAddress,
        note: `retryAfter=${retryAfterSeconds}s failedInWindow=${count}`,
      });
    }

    return NextResponse.json({
      ok: !hasLimit,
      failedAttemptsInWindow: count,
      maxFailedAttempts: MAX_FAILED_ATTEMPTS,
      retryAfterSeconds,
    });
  }

  if (payload.action !== "login-result") {
    return NextResponse.json({ error: "Unsupported action." }, { status: 400 });
  }

  const isSuccess = Boolean(payload.success);
  await insertSecurityEvent({
    eventType: isSuccess ? "login_success" : "login_failure",
    email,
    emailHash,
    userId: payload.userId ?? null,
    ipAddress,
    userAgent,
    metadata: payload.reason ? { reason: payload.reason } : {},
  });

  if (isSuccess) {
    if (payload.userId && ipAddress) {
      const adminClient = createSupabaseAdminClient();
      if (adminClient) {
        const { data: previousSuccesses } = await adminClient
          .from("auth_security_events")
          .select("id, ip_address")
          .eq("event_type", "login_success")
          .eq("user_id", payload.userId)
          .order("created_at", { ascending: false })
          .limit(20);
        const hasDifferentKnownIp = (previousSuccesses ?? []).some((row) => {
          const existingIp = typeof row.ip_address === "string" ? row.ip_address : null;
          return Boolean(existingIp) && existingIp !== ipAddress;
        });
        if (hasDifferentKnownIp) {
          await sendSecurityAlertEmail({
            locale: "en",
            recipientEmail: email,
            alertType: "new_ip_login",
            ipAddress,
          });
          await writeAuthSecurityLog({
            eventType: "email_alert_new_ip_login",
            email,
            userId: payload.userId ?? null,
            ipAddress,
          });
        }
      }
    }
    return NextResponse.json({ ok: true, alert: null });
  }

  const { count } = await getFailedAttemptsInWindow(emailHash);
  if (count === ALERT_FAILED_ATTEMPTS || count === ALERT_FAILED_ATTEMPTS_MAX) {
    await sendSecurityAlertEmail({
      locale: "en",
      recipientEmail: email,
      alertType: "failed_logins",
      failedAttemptsInWindow: count,
      windowMinutes: Math.floor(LOGIN_WINDOW_SECONDS / 60),
    });
    await writeAuthSecurityLog({
      eventType: "email_alert_failed_logins",
      email,
      ipAddress,
      note: `count=${count}`,
    });
  }
  const shouldAlert = count >= ALERT_FAILED_ATTEMPTS;
  return NextResponse.json({
    ok: true,
    alert: shouldAlert
      ? {
          type: "failed_attempts",
          failedAttemptsInWindow: count,
          windowSeconds: LOGIN_WINDOW_SECONDS,
          threshold: ALERT_FAILED_ATTEMPTS,
        }
      : null,
  });
}
