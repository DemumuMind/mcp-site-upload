import { appendFile, mkdir, readdir, unlink } from "node:fs/promises";
import path from "node:path";

const cleanupTracker = new Map<string, number>();
const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

function getTodayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function parseDateFromFileName(fileName: string, prefix: string): Date | null {
  const match = fileName.match(new RegExp(`^${prefix}-(\\d{4}-\\d{2}-\\d{2})\\.log$`));
  if (!match?.[1]) {
    return null;
  }
  const parsed = new Date(`${match[1]}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed;
}

export async function writeDailyLogFile(input: {
  prefix: string;
  line: string;
  retentionDays: number;
}): Promise<void> {
  const logsDir = path.join(process.cwd(), "logs");
  const fileName = `${input.prefix}-${getTodayKey()}.log`;
  const filePath = path.join(logsDir, fileName);
  await mkdir(logsDir, { recursive: true });
  await appendFile(filePath, input.line, "utf8");

  const now = Date.now();
  const cleanupKey = `${input.prefix}:${logsDir}`;
  const lastCleanup = cleanupTracker.get(cleanupKey) ?? 0;
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) {
    return;
  }
  cleanupTracker.set(cleanupKey, now);

  const files = await readdir(logsDir);
  const retentionMs = Math.max(input.retentionDays, 1) * 24 * 60 * 60 * 1000;
  await Promise.all(
    files.map(async (file) => {
      const fileDate = parseDateFromFileName(file, input.prefix);
      if (!fileDate) {
        return;
      }
      if (now - fileDate.getTime() > retentionMs) {
        await unlink(path.join(logsDir, file)).catch(() => undefined);
      }
    }),
  );
}

