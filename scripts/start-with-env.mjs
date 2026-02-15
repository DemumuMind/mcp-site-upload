#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import path from "node:path";
import { existsSync } from "node:fs";
import dotenv from "dotenv";

const cwd = process.cwd();
const envFiles = [".env", ".env.local"];
for (const file of envFiles) {
  const filePath = path.join(cwd, file);
  if (!existsSync(filePath)) {
    continue;
  }

  dotenv.config({
    path: filePath,
  });
}

const env = {
  ...process.env,
};

const nextArgs = ["start", ...process.argv.slice(2)];

const result = spawnSync("next", nextArgs, {
  stdio: "inherit",
  env,
  shell: true,
});

if (result.error) {
  console.error("[start-with-env] Failed to start Next.js:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
