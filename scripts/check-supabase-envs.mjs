#!/usr/bin/env node

import path from "node:path";
import { existsSync } from "node:fs";
import dotenv from "dotenv";

const envFiles = [".env", ".env.local"];
for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (!existsSync(filePath)) {
    continue;
  }

  dotenv.config({
    path: filePath,
  });
}

const REQUIRED_VARS = [
  "NEXT_PUBLIC_SUPABASE_URL",
  "SUPABASE_SERVICE_ROLE_KEY",
];

const PUBLISHABLE_KEY_GROUP = [
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
  "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY",
];

function isTruthy(value) {
  return typeof value === "string" ? value.trim().length > 0 : Boolean(value);
}

const missing = [];
for (const name of REQUIRED_VARS) {
  if (!isTruthy(process.env[name])) {
    missing.push(name);
  }
}

const hasPublishableKey = PUBLISHABLE_KEY_GROUP.some((name) => isTruthy(process.env[name]));
if (!hasPublishableKey) {
  missing.push(`one of: ${PUBLISHABLE_KEY_GROUP.join(", ")}`);
}

if (missing.length > 0) {
  console.error("Supabase environment check failed:");
  for (const entry of missing) {
    console.error(`  - missing ${entry}`);
  }
  process.exit(1);
}

console.log("Supabase environment check passed.");
