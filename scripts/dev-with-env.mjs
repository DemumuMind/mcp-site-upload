#!/usr/bin/env node

import { spawnSync } from "node:child_process";
import { loadRootEnvFiles, syncNextProjectEnvFiles } from "./_shared/next-env.mjs";

const cwd = process.cwd();

loadRootEnvFiles(cwd);
syncNextProjectEnvFiles(cwd);

const env = {
  ...process.env,
};

const nextArgs = ["dev", "frontend", "--webpack", ...process.argv.slice(2)];

const result = spawnSync("next", nextArgs, {
  stdio: "inherit",
  env,
  shell: true,
});

if (result.error) {
  console.error("[dev-with-env] Failed to start Next.js:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
