#!/usr/bin/env node

import fs from "node:fs/promises";
import path from "node:path";

const args = process.argv.slice(2);

function readArg(name) {
  const index = args.indexOf(name);
  if (index === -1) {
    return undefined;
  }

  return args[index + 1];
}

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function parseCsv(value) {
  if (!value) {
    return [];
  }

  return [...new Set(value.split(",").map((item) => item.trim()).filter(Boolean))];
}

async function main() {
  const inputSlug = readArg("--slug");
  const name = readArg("--name");

  if (!inputSlug || !name) {
    console.error(
      "Usage: npm run catalog:new -- --slug <slug> --name <name> [--description \"...\"] [--server-url \"...\"] [--category \"...\"] [--auth oauth|api_key|none] [--tags \"a,b\"] [--tools \"x,y\"]",
    );
    process.exit(1);
  }

  const slug = toSlug(inputSlug);
  if (!slug) {
    console.error("Invalid slug. Use letters, numbers, spaces, and hyphens.");
    process.exit(1);
  }

  const authTypeInput = (readArg("--auth") ?? "none").trim().toLowerCase();
  if (!["oauth", "api_key", "none"].includes(authTypeInput)) {
    console.error('Invalid auth type. Allowed: "oauth", "api_key", "none".');
    process.exit(1);
  }

  const entryRoot = path.join(process.cwd(), "content", "catalog", "entries");
  const filePath = path.join(entryRoot, `${slug}.json`);

  await fs.mkdir(entryRoot, { recursive: true });

  try {
    await fs.access(filePath);
    console.error(`Catalog entry already exists: ${path.relative(process.cwd(), filePath)}`);
    process.exit(1);
  } catch {
    // file does not exist yet
  }

  const entry = {
    name,
    slug,
    description: readArg("--description") ?? "Add a short description for this MCP server.",
    serverUrl: readArg("--server-url") ?? "",
    category: readArg("--category") ?? "Other",
    authType: authTypeInput,
    tags: parseCsv(readArg("--tags")),
    status: "active",
    verificationLevel: "community",
    tools: parseCsv(readArg("--tools")),
  };

  await fs.writeFile(filePath, `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  console.log(`Created: ${path.relative(process.cwd(), filePath)}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
