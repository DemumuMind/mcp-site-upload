#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const migrationsDir = path.resolve("supabase/migrations");

if (!fs.existsSync(migrationsDir)) {
  console.error(`Migrations directory not found: ${migrationsDir}`);
  process.exit(1);
}

const migrationFiles = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith(".sql"))
  .sort((left, right) => left.localeCompare(right));

const seenPrefixes = new Map();
let hasErrors = false;
let previousPrefix = null;

for (const fileName of migrationFiles) {
  const match = /^(\d{14})_(.+)\.sql$/.exec(fileName);
  if (!match) {
    console.error(`Invalid migration filename format: ${fileName}`);
    hasErrors = true;
    continue;
  }

  const prefix = match[1];
  if (seenPrefixes.has(prefix)) {
    console.error(`Duplicate migration prefix detected: ${prefix} in ${fileName} and ${seenPrefixes.get(prefix)}`);
    hasErrors = true;
  } else {
    seenPrefixes.set(prefix, fileName);
  }

  if (previousPrefix && prefix <= previousPrefix) {
    console.error(`Non-monotonic migration prefix order: ${fileName} (prefix ${prefix}) after ${previousPrefix}`);
    hasErrors = true;
  }

  previousPrefix = prefix;
}

if (hasErrors) {
  process.exit(1);
}

console.log(`Migration prefix check passed for ${migrationFiles.length} files.`);
