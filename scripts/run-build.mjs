import { spawnSync } from "node:child_process";

const normalizedCwd = process.cwd().replace(/\\/g, "/");
const env = {
  ...process.env,
  PWD: normalizedCwd,
  INIT_CWD: process.env.INIT_CWD ?? normalizedCwd,
};

function run(command, label) {
  const result = spawnSync(command, {
    stdio: "inherit",
    env,
    shell: true,
  });

  if (result.error) {
    console.error(`[run-build] Failed to start ${label}:`, result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run("contentlayer2 build", "contentlayer2 build");
run("next build --webpack", "next build");
