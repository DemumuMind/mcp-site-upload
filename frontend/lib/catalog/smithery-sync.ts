import { runCatalogIngestion, type CatalogSyncResult } from "./ingestion.ts";

export async function runCatalogSmitherySync(): Promise<CatalogSyncResult> {
  return runCatalogIngestion({
    sourceTypes: ["smithery"],
  });
}
