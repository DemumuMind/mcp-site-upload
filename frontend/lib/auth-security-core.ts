import { createHash } from "node:crypto";
import {
  AUTH_ALERT_FAILED_ATTEMPTS_ESCALATION_THRESHOLD,
  AUTH_ALERT_FAILED_ATTEMPTS_THRESHOLD,
  AUTH_LOGIN_WINDOW_SECONDS,
  AUTH_MAX_FAILED_ATTEMPTS,
} from "./cache/policy.ts";

export type PrecheckPayload = {
  action: "precheck";
  email?: string;
};

export type LoginResultPayload = {
  action: "login-result";
  email?: string;
  success?: boolean;
  userId?: string | null;
  reason?: string;
};

export type SecurityPayload = PrecheckPayload | LoginResultPayload;

type SecurityCoreDeps = {
  parseJsonBody: () => Promise<unknown>;
  getClientIpAddress: () => string | null;
  getUserAgent: () => string | null;
  getFailedAttemptsInWindow: (
    emailHash: string,
    ipAddress: string | null,
  ) => Promise<{ count: number; oldestCreatedAt: string | null }>;
  insertSecurityEvent: (input: {
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
  }) => Promise<void>;
  writeSecurityLog: (input: {
    eventType: string;
    email?: string;
    userId?: string | null;
    ipAddress?: string | null;
    note?: string;
  }) => Promise<void>;
  hasDifferentKnownIp: (input: { userId: string; ipAddress: string }) => Promise<boolean>;
  sendSecurityAlertEmail: (input: {
    locale: "en";
    recipientEmail: string;
    alertType: "failed_logins" | "new_ip_login";
    failedAttemptsInWindow?: number;
    windowMinutes?: number;
    ipAddress?: string | null;
  }) => Promise<void>;
  now?: () => number;
};

export function normalizeEmail(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

export function hashEmail(email: string): string {
  return createHash("sha256").update(email).digest("hex");
}

export async function executeAuthSecurityRequest(
  deps: SecurityCoreDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  let payload: SecurityPayload;
  try {
    payload = (await deps.parseJsonBody()) as SecurityPayload;
  } catch {
    return {
      status: 400,
      body: { ok: false, error: "Invalid JSON payload." },
    };
  }

  const email = normalizeEmail(payload.email);
  if (!email) {
    return {
      status: 400,
      body: { ok: false, error: "Email is required." },
    };
  }

  const emailHash = hashEmail(email);
  const ipAddress = deps.getClientIpAddress();
  const userAgent = deps.getUserAgent();
  const now = deps.now ?? Date.now;

  if (payload.action === "precheck") {
    if (!ipAddress) {
      return {
        status: 200,
        body: {
          ok: true,
          failedAttemptsInWindow: 0,
          maxFailedAttempts: AUTH_MAX_FAILED_ATTEMPTS,
          retryAfterSeconds: 0,
        },
      };
    }

    const { count, oldestCreatedAt } = await deps.getFailedAttemptsInWindow(emailHash, ipAddress);
    const hasLimit = count >= AUTH_MAX_FAILED_ATTEMPTS;

    let retryAfterSeconds = 0;
    if (hasLimit && oldestCreatedAt) {
      const elapsedSeconds = Math.floor((now() - new Date(oldestCreatedAt).getTime()) / 1000);
      retryAfterSeconds = Math.max(0, AUTH_LOGIN_WINDOW_SECONDS - elapsedSeconds);
    }

    if (hasLimit) {
      await deps.insertSecurityEvent({
        eventType: "login_rate_limited",
        email,
        emailHash,
        ipAddress,
        userAgent,
        metadata: { failedAttemptsInWindow: count, retryAfterSeconds },
      });
      await deps.writeSecurityLog({
        eventType: "precheck_blocked",
        email,
        ipAddress,
        note: `retryAfter=${retryAfterSeconds}s failedInWindow=${count}`,
      });
    }

    return {
      status: 200,
      body: {
        ok: !hasLimit,
        failedAttemptsInWindow: count,
        maxFailedAttempts: AUTH_MAX_FAILED_ATTEMPTS,
        retryAfterSeconds,
      },
    };
  }

  if (payload.action !== "login-result") {
    return {
      status: 400,
      body: { ok: false, error: "Unsupported action." },
    };
  }

  const isSuccess = Boolean(payload.success);
  await deps.insertSecurityEvent({
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
      const hasDifferentKnownIp = await deps.hasDifferentKnownIp({
        userId: payload.userId,
        ipAddress,
      });
      if (hasDifferentKnownIp) {
        await deps.sendSecurityAlertEmail({
          locale: "en",
          recipientEmail: email,
          alertType: "new_ip_login",
          ipAddress,
        });
        await deps.writeSecurityLog({
          eventType: "email_alert_new_ip_login",
          email,
          userId: payload.userId ?? null,
          ipAddress,
        });
      }
    }

    return {
      status: 200,
      body: { ok: true, alert: null },
    };
  }

  const { count } = await deps.getFailedAttemptsInWindow(emailHash, ipAddress);
  if (
    count === AUTH_ALERT_FAILED_ATTEMPTS_THRESHOLD ||
    count === AUTH_ALERT_FAILED_ATTEMPTS_ESCALATION_THRESHOLD
  ) {
    await deps.sendSecurityAlertEmail({
      locale: "en",
      recipientEmail: email,
      alertType: "failed_logins",
      failedAttemptsInWindow: count,
      windowMinutes: Math.floor(AUTH_LOGIN_WINDOW_SECONDS / 60),
    });
    await deps.writeSecurityLog({
      eventType: "email_alert_failed_logins",
      email,
      ipAddress,
      note: `count=${count}`,
    });
  }

  const shouldAlert = count >= AUTH_ALERT_FAILED_ATTEMPTS_THRESHOLD;
  return {
    status: 200,
    body: {
      ok: true,
      alert: shouldAlert
        ? {
            type: "failed_attempts",
            failedAttemptsInWindow: count,
            windowSeconds: AUTH_LOGIN_WINDOW_SECONDS,
            threshold: AUTH_ALERT_FAILED_ATTEMPTS_THRESHOLD,
          }
        : null,
    },
  };
}
