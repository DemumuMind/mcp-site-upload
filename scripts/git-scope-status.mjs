import { spawnSync } from "node:child_process";

const filter = (process.argv[2] ?? "").trim();
const gitArgs = ["status", "--short"];
const result = spawnSync("git", gitArgs, {
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});

if (result.status !== 0) {
  process.stderr.write(result.stderr || "Failed to run git status.\n");
  process.exit(result.status ?? 1);
}

const lines = result.stdout
  .split(/\r?\n/)
  .map((line) => line.trimEnd())
  .filter(Boolean);

const selected = filter
  ? lines.filter((line) => line.toLowerCase().includes(filter.toLowerCase()))
  : lines;

if (selected.length === 0) {
  process.stdout.write(filter ? `No changes matched filter: ${filter}\n` : "No local changes.\n");
  process.exit(0);
}

process.stdout.write(selected.join("\n") + "\n");
