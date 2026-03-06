import { execFileSync } from "node:child_process";

function runGit(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function getChangedFiles() {
  try {
    const workingTreeDiff = runGit(["diff", "--name-only", "HEAD"]);
    if (workingTreeDiff) {
      return workingTreeDiff.split(/\r?\n/).filter(Boolean);
    }
  } catch {
    // Fall through to commit-based detection.
  }

  const baseRef = process.env.GITHUB_BASE_REF?.trim();
  try {
    if (baseRef) {
      const mergeBase = runGit(["merge-base", "HEAD", `origin/${baseRef}`]);
      const diff = runGit(["diff", "--name-only", `${mergeBase}...HEAD`]);
      return diff ? diff.split(/\r?\n/).filter(Boolean) : [];
    }
  } catch {
    // Fall back to HEAD^ on local runs or shallow environments.
  }

  try {
    const diff = runGit(["diff", "--name-only", "HEAD^", "HEAD"]);
    return diff ? diff.split(/\r?\n/).filter(Boolean) : [];
  } catch {
    return [];
  }
}

const changedFiles = getChangedFiles();
const changedApiRoutes = changedFiles.filter((file) => file.startsWith("frontend/app/api/"));

if (changedApiRoutes.length === 0) {
  console.log("API route change discipline check skipped: no API route changes detected.");
  process.exit(0);
}

const hasApiDocsUpdate = changedFiles.some((file) => file.startsWith("docs/api/"));
const hasApiTestUpdate = changedFiles.some(
  (file) => file.startsWith("tests/") || file.startsWith("node-tests/"),
);

if (!hasApiDocsUpdate) {
  console.error("API route changes detected without docs/api updates.");
  process.exit(1);
}

if (!hasApiTestUpdate) {
  console.error("API route changes detected without tests or node-tests updates.");
  process.exit(1);
}

console.log("API route change discipline check passed.");
