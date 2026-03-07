import { runCatalogIngestion, type CatalogSyncResult } from "./ingestion.ts";

export type { CatalogSyncResult };

export async function runCatalogGithubSync(options: { maxPages?: number } = {}): Promise<CatalogSyncResult> {
  return runCatalogIngestion({
    sourceTypes: ["github"],
    githubMaxPages: options.maxPages,
  });
}
