import { parseCatalogQueryV2 } from "./query-v2.ts";
import { runCatalogSearch } from "./server-search.ts";
import { getCatalogSnapshot, type CatalogSnapshot } from "./snapshot.ts";
import {
  buildCatalogWorkspaceCore,
  type CatalogWorkspaceCore,
  type CatalogWorkspaceSearchParams,
} from "./workspace-core.ts";
import type { CatalogQueryV2, CatalogSearchResult } from "./types.ts";
import type { McpServer } from "@/lib/types";

export type CatalogPageSearchParams = CatalogWorkspaceSearchParams;
export type CatalogWorkspaceSummary = Pick<
  CatalogSnapshot,
  "totalServers" | "totalTools" | "totalCategories" | "featuredServers"
>;
export type CatalogWorkspace = CatalogWorkspaceCore<McpServer, CatalogQueryV2, CatalogSearchResult>;

export function buildCatalogWorkspace(
  snapshot: CatalogSnapshot,
  searchParams: CatalogPageSearchParams = {},
): CatalogWorkspace {
  return buildCatalogWorkspaceCore(snapshot, searchParams, {
    parseQuery: parseCatalogQueryV2,
    runSearch: runCatalogSearch,
  });
}

export async function getCatalogWorkspace(
  searchParams: CatalogPageSearchParams = {},
): Promise<CatalogWorkspace> {
  const snapshot = await getCatalogSnapshot();
  return buildCatalogWorkspace(snapshot, searchParams);
}
