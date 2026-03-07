import { runCatalogIngestion, type CatalogSyncResult } from "./ingestion.ts";

export async function runCatalogNpmSync(): Promise<CatalogSyncResult> {
  return runCatalogIngestion({
    sourceTypes: ["npm"],
  });
}
