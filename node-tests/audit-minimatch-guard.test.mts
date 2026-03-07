import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";

function parseVersion(version: string) {
  return version.split(".").map((segment) => Number.parseInt(segment, 10));
}

function isAtLeast(version: string, minimum: string) {
  const left = parseVersion(version);
  const right = parseVersion(minimum);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const leftValue = left[index] ?? 0;
    const rightValue = right[index] ?? 0;

    if (leftValue > rightValue) {
      return true;
    }
    if (leftValue < rightValue) {
      return false;
    }
  }

  return true;
}

test("typescript-eslint minimatch stays on a non-vulnerable release", () => {
  const lockfilePath = path.join(process.cwd(), "package-lock.json");
  const lockfile = JSON.parse(fs.readFileSync(lockfilePath, "utf8")) as {
    packages?: Record<string, { version?: string }>;
  };

  const minimatchEntry =
    lockfile.packages?.["node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch"];

  assert.ok(minimatchEntry?.version, "expected minimatch entry under @typescript-eslint/typescript-estree");
  assert.equal(
    isAtLeast(minimatchEntry.version, "9.0.7") || minimatchEntry.version.startsWith("10."),
    true,
    `expected minimatch >= 9.0.7, got ${minimatchEntry.version}`,
  );
});
