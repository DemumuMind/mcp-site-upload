import { writeDailyLogFile } from "@/lib/log-file-utils";

type AdminRequestLogInput = {
  path: string;
  query: string;
  source: "admin_page";
};

const recentKeys = new Map<string, number>();
const DEDUPE_WINDOW_MS = 30_000;

function isEnabled(): boolean {
  const value = process.env.ADMIN_REQUEST_LOG_ENABLED?.trim().toLowerCase();
  return value === "1" || value === "true" || value === "yes";
}

export async function writeAdminRequestLog(input: AdminRequestLogInput): Promise<void> {
  if (!isEnabled()) {
    return;
  }

  const now = Date.now();
  const dedupeKey = `${input.path}?${input.query}`;
  const previous = recentKeys.get(dedupeKey) ?? 0;
  if (now - previous < DEDUPE_WINDOW_MS) {
    return;
  }
  recentKeys.set(dedupeKey, now);

  const retentionDays = Number.parseInt(process.env.ADMIN_REQUEST_LOG_RETENTION_DAYS ?? "14", 10);
  const line = `${new Date(now).toISOString()} source=${input.source} path=${input.path} query=${input.query || "-"}\n`;
  await writeDailyLogFile({
    prefix: "admin-requests",
    line,
    retentionDays: Number.isFinite(retentionDays) ? retentionDays : 14,
  });
}
