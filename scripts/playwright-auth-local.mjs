#!/usr/bin/env node

import { spawnSync } from "node:child_process";

const baseUrl = process.env.PLAYWRIGHT_BASE_URL ?? "http://127.0.0.1:3101";
const env = {
  ...process.env,
  PLAYWRIGHT_BASE_URL: baseUrl,
};

const result = spawnSync("npx", ["playwright", "test", "tests/auth-flow.spec.ts"], {
  stdio: "inherit",
  env,
  shell: true,
});

if (result.error) {
  console.error("Failed to start Playwright:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
