import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";

const ROOT_ENV_FILES = [".env", ".env.local"];

export function loadRootEnvFiles(repoRoot = process.cwd()) {
  for (const file of ROOT_ENV_FILES) {
    const filePath = path.join(repoRoot, file);
    if (!fs.existsSync(filePath)) {
      continue;
    }

    dotenv.config({
      path: filePath,
      override: file === ".env.local",
    });
  }
}

export function syncNextProjectEnvFiles(repoRoot = process.cwd(), appDir = "frontend") {
  const rootEnvPath = path.join(repoRoot, ".env");
  const targetPath = path.join(repoRoot, appDir, ".env");

  if (!fs.existsSync(rootEnvPath)) {
    return {
      synced: false,
      targetPath,
    };
  }

  const source = fs.readFileSync(rootEnvPath, "utf8");
  const current = fs.existsSync(targetPath) ? fs.readFileSync(targetPath, "utf8") : null;

  if (current !== source) {
    fs.writeFileSync(targetPath, source, "utf8");
  }

  return {
    synced: true,
    targetPath,
  };
}
