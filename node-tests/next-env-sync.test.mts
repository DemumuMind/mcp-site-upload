import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { syncNextProjectEnvFiles } from "../scripts/_shared/next-env.mjs";

test("syncs root .env into frontend/.env for next runtime discovery", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-site-env-sync-"));
  const frontendDir = path.join(repoRoot, "frontend");
  fs.mkdirSync(frontendDir, { recursive: true });

  const rootEnvPath = path.join(repoRoot, ".env");
  const frontendEnvPath = path.join(frontendDir, ".env");

  fs.writeFileSync(rootEnvPath, "FOO=bar\nBAR=baz\n", "utf8");

  const result = syncNextProjectEnvFiles(repoRoot);

  assert.equal(result.synced, true);
  assert.equal(result.targetPath, frontendEnvPath);
  assert.equal(fs.readFileSync(frontendEnvPath, "utf8"), "FOO=bar\nBAR=baz\n");
});

test("leaves frontend/.env untouched when root .env is missing", () => {
  const repoRoot = fs.mkdtempSync(path.join(os.tmpdir(), "mcp-site-env-sync-"));
  const frontendDir = path.join(repoRoot, "frontend");
  fs.mkdirSync(frontendDir, { recursive: true });

  const result = syncNextProjectEnvFiles(repoRoot);

  assert.equal(result.synced, false);
  assert.equal(fs.existsSync(path.join(frontendDir, ".env")), false);
});
