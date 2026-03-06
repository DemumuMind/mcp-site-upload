import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const docsDir = path.join(root, "docs", "api");

const requiredFiles = [
  "backend-route-standard.md",
  "endpoint-inventory-v2.md",
  "endpoint-inventory-v2.json",
  "openapi-lite.yaml",
  "route-authoring-checklist.md",
  "testing-matrix.md",
];

const requiredPaths = [
  "/api/health",
  "/api/catalog/search",
  "/api/catalog/auto-sync",
  "/api/catalog/sync-all",
  "/api/tasks",
  "/api/tasks/{id}",
  "/api/auth/security",
  "/api/admin/security-events/export",
  "/api/admin/multi-agent/weekly-export",
];

async function main() {
  for (const file of requiredFiles) {
    const filePath = path.join(docsDir, file);
    await fs.access(filePath);
  }

  const inventoryJsonPath = path.join(docsDir, "endpoint-inventory-v2.json");
  const openApiPath = path.join(docsDir, "openapi-lite.yaml");
  const standardPath = path.join(docsDir, "backend-route-standard.md");
  const checklistPath = path.join(docsDir, "route-authoring-checklist.md");
  const testingMatrixPath = path.join(docsDir, "testing-matrix.md");

  const inventoryJsonRaw = await fs.readFile(inventoryJsonPath, "utf8");
  const inventoryJson = JSON.parse(inventoryJsonRaw);
  if (!Array.isArray(inventoryJson.groups)) {
    throw new Error("endpoint-inventory-v2.json must contain a groups array.");
  }

  const inventoryPaths = new Set(
    inventoryJson.groups.flatMap((group) =>
      Array.isArray(group.endpoints) ? group.endpoints.map((endpoint) => endpoint.path) : [],
    ),
  );

  const openApiRaw = await fs.readFile(openApiPath, "utf8");
  for (const requiredPath of requiredPaths) {
    if (!inventoryPaths.has(requiredPath)) {
      throw new Error(`endpoint-inventory-v2.json is missing ${requiredPath}`);
    }
    if (!openApiRaw.includes(requiredPath)) {
      throw new Error(`openapi-lite.yaml is missing ${requiredPath}`);
    }
  }

  const standardRaw = await fs.readFile(standardPath, "utf8");
  if (!standardRaw.includes("route-authoring-checklist.md")) {
    throw new Error("backend-route-standard.md must reference route-authoring-checklist.md");
  }

  const checklistRaw = await fs.readFile(checklistPath, "utf8");
  if (!checklistRaw.includes("endpoint-inventory-v2.json")) {
    throw new Error("route-authoring-checklist.md must reference endpoint-inventory-v2.json");
  }

  const testingMatrixRaw = await fs.readFile(testingMatrixPath, "utf8");
  if (!testingMatrixRaw.includes("route-authoring-checklist.md")) {
    throw new Error("testing-matrix.md must reference route-authoring-checklist.md");
  }

  console.log("API docs check passed.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
});
