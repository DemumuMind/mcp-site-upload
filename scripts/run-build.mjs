import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const normalizedCwd = process.cwd().replace(/\\/g, "/");

const envFiles = [".env", ".env.local"];
for (const file of envFiles) {
  const filePath = path.join(process.cwd(), file);
  if (!existsSync(filePath)) {
    continue;
  }

  dotenv.config({
    path: filePath,
    override: file === ".env.local",
  });
}

const env = {
  ...process.env,
  PWD: normalizedCwd,
  INIT_CWD: process.env.INIT_CWD ?? normalizedCwd,
};

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}

function run(command, label, { retries = 0, retryDelayMs = 1500 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    const result = spawnSync(command, {
      stdio: "pipe",
      encoding: "utf8",
      env,
      shell: true,
    });

    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }

    if (result.error) {
      console.error(`[run-build] Failed to start ${label}:`, result.error.message);
      process.exit(1);
    }

    if (result.status === 0) {
      return;
    }

    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
    const lockError = /Unable to acquire lock at .*\.next[\\/]+lock/i.test(output);
    const canRetry = lockError && attempt < retries;

    if (!canRetry) {
      process.exit(result.status ?? 1);
    }

    console.warn(
      `[run-build] ${label} hit Next.js lock (attempt ${attempt + 1}/${retries + 1}). Retrying in ${retryDelayMs}ms...`,
    );
    sleep(retryDelayMs);
  }
}

run("contentlayer2 build", "contentlayer2 build");
run("next build --webpack", "next build", { retries: 3, retryDelayMs: 2000 });
