#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const args = parseArgs(process.argv.slice(2));
const manifestPath = path.resolve(
  args.manifest || process.env.BACKUP_MANIFEST_PATH || "ops/backup-manifest.json",
);
const maxAgeHours = parsePositiveNumber(
  args["max-age-hours"] || process.env.BACKUP_MAX_AGE_HOURS || "26",
  26,
);
const maxRestoreDrillAgeDays = parsePositiveNumber(
  args["max-restore-drill-age-days"] || process.env.BACKUP_MAX_RESTORE_DRILL_AGE_DAYS || "45",
  45,
);
const expectedRetentionDays = parsePositiveNumber(
  process.env.BACKUP_RETENTION_DAYS || "30",
  30,
);
const jsonOutput = args.json === true;

const failures = [];
const warnings = [];
const checks = [];

if (!fs.existsSync(manifestPath)) {
  failures.push(`Backup manifest not found: ${manifestPath}`);
  finish();
}

let manifest = null;
try {
  const raw = fs.readFileSync(manifestPath, "utf8");
  manifest = JSON.parse(raw);
} catch (error) {
  failures.push(`Unable to parse backup manifest: ${error instanceof Error ? error.message : String(error)}`);
  finish();
}

const now = Date.now();

const lastSuccessfulBackupAt = parseDate(manifest.lastSuccessfulBackupAt);
if (!lastSuccessfulBackupAt) {
  failures.push("Manifest field lastSuccessfulBackupAt is missing or invalid.");
} else {
  const backupAgeHours = (now - lastSuccessfulBackupAt.getTime()) / (1000 * 60 * 60);
  const freshEnough = backupAgeHours <= maxAgeHours;
  checks.push({
    name: "Backup freshness",
    ok: freshEnough,
    details: `age=${backupAgeHours.toFixed(2)}h max=${maxAgeHours}h`,
  });
  if (!freshEnough) {
    failures.push(`Latest backup is too old: ${backupAgeHours.toFixed(2)}h > ${maxAgeHours}h.`);
  }
}

if (typeof manifest.backupLocation !== "string" || manifest.backupLocation.trim().length === 0) {
  failures.push("Manifest field backupLocation is missing or empty.");
} else {
  checks.push({
    name: "Backup location",
    ok: true,
    details: manifest.backupLocation.trim(),
  });
}

if (!Number.isFinite(Number(manifest.retentionDays))) {
  failures.push("Manifest field retentionDays is missing or invalid.");
} else if (Number(manifest.retentionDays) < expectedRetentionDays) {
  failures.push(
    `Retention policy is too short: ${Number(manifest.retentionDays)} days < ${expectedRetentionDays} days.`,
  );
} else {
  checks.push({
    name: "Retention policy",
    ok: true,
    details: `${Number(manifest.retentionDays)} days`,
  });
}

const lastRestoreDrillAt = parseDate(manifest.lastRestoreDrillAt);
if (!lastRestoreDrillAt) {
  failures.push("Manifest field lastRestoreDrillAt is missing or invalid.");
} else {
  const restoreDrillAgeDays = (now - lastRestoreDrillAt.getTime()) / (1000 * 60 * 60 * 24);
  const drillRecentEnough = restoreDrillAgeDays <= maxRestoreDrillAgeDays;
  checks.push({
    name: "Restore drill freshness",
    ok: drillRecentEnough,
    details: `age=${restoreDrillAgeDays.toFixed(2)}d max=${maxRestoreDrillAgeDays}d`,
  });
  if (!drillRecentEnough) {
    failures.push(
      `Latest restore drill is too old: ${restoreDrillAgeDays.toFixed(2)}d > ${maxRestoreDrillAgeDays}d.`,
    );
  }
}

if (manifest.notes && typeof manifest.notes !== "string") {
  warnings.push("Manifest notes should be a string when present.");
}

finish();

function finish() {
  const report = {
    checkedAt: new Date().toISOString(),
    manifestPath,
    maxAgeHours,
    maxRestoreDrillAgeDays,
    expectedRetentionDays,
    ok: failures.length === 0,
    failures,
    warnings,
    checks,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`Backup verification for ${manifestPath}`);
    for (const check of checks) {
      const marker = check.ok ? "PASS" : "FAIL";
      console.log(`${marker} ${check.name}: ${check.details}`);
    }
    for (const warning of warnings) {
      console.log(`WARN ${warning}`);
    }
    for (const failure of failures) {
      console.error(`FAIL ${failure}`);
    }
    console.log(
      `Summary: ${checks.filter((check) => check.ok).length}/${checks.length} checks passed, ${failures.length} failure(s).`,
    );
  }

  process.exit(failures.length === 0 ? 0 : 1);
}

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];

    if (!token.startsWith("--")) {
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];

    if (!next || next.startsWith("--")) {
      parsed[key] = true;
      continue;
    }

    parsed[key] = next;
    index += 1;
  }

  return parsed;
}

function parsePositiveNumber(value, fallback) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
}

function parseDate(value) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
}
