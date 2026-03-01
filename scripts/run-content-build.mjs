import { spawnSync } from "node:child_process";
import path from "node:path";

const frontendDir = path.join(process.cwd(), "frontend");

const result = spawnSync("contentlayer2", ["build"], {
  cwd: frontendDir,
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
  },
});

if (result.error) {
  console.error("[run-content-build] Failed to start contentlayer2:", result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 0);
