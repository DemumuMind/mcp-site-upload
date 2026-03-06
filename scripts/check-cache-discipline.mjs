#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SCAN_ROOTS = ["frontend", "scripts"];
const CODE_EXTENSIONS = new Set([".ts", ".tsx", ".mts", ".cts", ".js", ".mjs", ".cjs"]);
const CACHE_DISCIPLINE_SCRIPT_FILE = "scripts/check-cache-discipline.mjs";
const NEXT_CACHE_RUNTIME_FILE = "frontend/lib/cache/next-runtime.ts";
const INVALIDATION_HELPER_FILE = "frontend/lib/cache/invalidation.ts";

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function getTrackedCodeFiles() {
  const output = runGit(["ls-files", "--", ...SCAN_ROOTS]);
  if (!output) {
    return [];
  }

  return output
    .split(/\r?\n/)
    .filter(Boolean)
    .filter((filePath) => CODE_EXTENSIONS.has(path.extname(filePath)));
}

function toLineViolations(filePath, source, matcher, message, allow = () => false) {
  const violations = [];
  const lines = source.split(/\r?\n/);

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index];
    if (!matcher.test(line)) {
      continue;
    }
    if (allow(filePath, line)) {
      continue;
    }
    violations.push({
      filePath,
      line: index + 1,
      message,
      sourceLine: line.trim(),
    });
  }

  return violations;
}

function collectViolations(filePath) {
  const source = fs.readFileSync(filePath, "utf8");
  return [
    ...toLineViolations(
      filePath,
      source,
      /cache:\s*["']no-store["']/,
      'Use `withRequestCachePolicy(...)` instead of inline `cache: "no-store"`.',
      (currentFilePath) => currentFilePath === CACHE_DISCIPLINE_SCRIPT_FILE,
    ),
    ...toLineViolations(
      filePath,
      source,
      /from\s+["']next\/cache(?:\.js)?["']/,
      "Import Next cache APIs through `frontend/lib/cache/next-runtime.ts`.",
      (currentFilePath) => currentFilePath === NEXT_CACHE_RUNTIME_FILE,
    ),
    ...toLineViolations(
      filePath,
      source,
      /\b(?:revalidatePath|revalidateTag|updateTag)\s*\(/,
      "Use `frontend/lib/cache/invalidation.ts` instead of direct Next invalidation calls.",
      (currentFilePath) => currentFilePath === INVALIDATION_HELPER_FILE,
    ),
  ];
}

const trackedCodeFiles = getTrackedCodeFiles();
const violations = trackedCodeFiles.flatMap((filePath) => collectViolations(filePath));

if (violations.length > 0) {
  console.error("Cache discipline check failed.");
  for (const violation of violations) {
    console.error(`- ${violation.filePath}:${violation.line} ${violation.message}`);
    console.error(`  ${violation.sourceLine}`);
  }
  process.exit(1);
}

console.log(`Cache discipline check passed (${trackedCodeFiles.length} files scanned).`);
