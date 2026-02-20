import { config } from "dotenv";
import { resolve } from "path";

config({ path: resolve(process.cwd(), ".env.local") });

async function runAll() {
  console.log("Starting full catalog synchronization...");

  try {
    const { runCatalogGithubSync } = await import("../lib/catalog/github-sync");
    const { runCatalogSmitherySync } = await import("../lib/catalog/smithery-sync");
    const { runCatalogNpmSync } = await import("../lib/catalog/npm-sync");

    console.log("--- Syncing GitHub ---");
    const github = await runCatalogGithubSync({ maxPages: 2 });
    console.log(`GitHub: Created ${github.created}, Updated ${github.updated}, Failed ${github.failed}`);

    console.log("--- Syncing Smithery.ai ---");
    const smithery = await runCatalogSmitherySync();
    console.log(`Smithery: Created ${smithery.created}, Updated ${smithery.updated}, Failed ${smithery.failed}`);

    console.log("--- Syncing NPM ---");
    const npm = await runCatalogNpmSync();
    console.log(`NPM: Created ${npm.created}, Updated ${npm.updated}, Failed ${npm.failed}`);

    console.log("\nAll sync tasks finished!");
  } catch (error) {
    console.error("\nFatal error during sync:");
    console.error(error);
    process.exit(1);
  }
}

void runAll();
