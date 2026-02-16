import { spawn } from "node:child_process";

const isWin = process.platform === "win32";
const command = isWin ? "npx.cmd" : "npx";
const args = ["playwright", "test", ...process.argv.slice(2)];

const env = { ...process.env };
delete env.NO_COLOR;

const child = spawn(command, args, {
  stdio: "inherit",
  env,
  shell: isWin,
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }
  process.exit(code ?? 1);
});
