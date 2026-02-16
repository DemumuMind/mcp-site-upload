import { writeDailyLogFile } from "@/lib/log-file-utils";

type AuthSecurityLogInput = {
  eventType: string;
  email?: string;
  userId?: string | null;
  ipAddress?: string | null;
  note?: string;
};

function isEnabled(): boolean {
  const value = process.env.AUTH_SECURITY_LOG_ENABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export async function writeAuthSecurityLog(input: AuthSecurityLogInput): Promise<void> {
  if (!isEnabled()) {
    return;
  }

  const retentionDays = Number.parseInt(process.env.AUTH_SECURITY_LOG_RETENTION_DAYS ?? "14", 10);
  const line = [
    new Date().toISOString(),
    `event=${input.eventType}`,
    `email=${input.email ?? "-"}`,
    `user=${input.userId ?? "-"}`,
    `ip=${input.ipAddress ?? "-"}`,
    `note=${input.note ?? "-"}`,
  ].join(" ") + "\n";
  await writeDailyLogFile({
    prefix: "auth-security",
    line,
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : 14,
  });
}
