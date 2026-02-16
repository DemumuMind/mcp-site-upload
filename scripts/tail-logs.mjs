import { readFile, readdir } from "node:fs/promises";
import path from "node:path";

const LOG_DIR = path.join(process.cwd(), "logs");
const LINES = 60;

async function getLatestLogFile(prefix) {
  let files = [];
  try {
    files = await readdir(LOG_DIR);
  } catch {
    return null;
  }
  const candidates = files
    .filter((name) => name.startsWith(`${prefix}-`) && name.endsWith(".log"))
    .sort((a, b) => b.localeCompare(a));
  return candidates[0] ? path.join(LOG_DIR, candidates[0]) : null;
}

function tailLines(content, maxLines) {
  const lines = content.split(/\r?\n/).filter(Boolean);
  return lines.slice(-maxLines).join("\n");
}

async function printTail(prefix) {
  const filePath = await getLatestLogFile(prefix);
  if (!filePath) {
    console.log(`\n[${prefix}] no log files found`);
    return;
  }
  const content = await readFile(filePath, "utf8");
  console.log(`\n[${prefix}] ${filePath}`);
  console.log(tailLines(content, LINES) || "(empty)");
}

await printTail("admin-requests");
await printTail("auth-security");

