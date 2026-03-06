import {
  buildCatalogWorkspace,
  getCatalogWorkspace,
  type CatalogPageSearchParams,
  type CatalogWorkspaceSummary,
} from "./workspace.ts";
import type { CatalogQueryV2, CatalogSearchResult } from "./types.ts";
import type { McpServer } from "@/lib/types";

export type { CatalogPageSearchParams } from "./workspace.ts";
export type CatalogPageSummary = CatalogWorkspaceSummary;

export type CatalogPageViewModel = {
  summary: CatalogPageSummary;
  initialQuery: CatalogQueryV2;
  initialResult: CatalogSearchResult;
  featuredServers: McpServer[];
  topCategoryEntries: Array<[string, number]>;
  topTagEntries: Array<[string, number]>;
  hasActiveFilters: boolean;
};

export function buildCatalogPageViewModel(
  snapshot: Parameters<typeof buildCatalogWorkspace>[0],
  searchParams: CatalogPageSearchParams = {},
): CatalogPageViewModel {
  const workspace = buildCatalogWorkspace(snapshot, searchParams);

  return {
    summary: workspace.summary,
    initialQuery: workspace.query,
    initialResult: workspace.result,
    featuredServers: workspace.featuredServers,
    topCategoryEntries: workspace.topCategoryEntries,
    topTagEntries: workspace.topTagEntries,
    hasActiveFilters: workspace.hasActiveFilters,
  };
}

export async function getCatalogPageViewModel(
  searchParams: CatalogPageSearchParams = {},
): Promise<CatalogPageViewModel> {
  const workspace = await getCatalogWorkspace(searchParams);

  return {
    summary: workspace.summary,
    initialQuery: workspace.query,
    initialResult: workspace.result,
    featuredServers: workspace.featuredServers,
    topCategoryEntries: workspace.topCategoryEntries,
    topTagEntries: workspace.topTagEntries,
    hasActiveFilters: workspace.hasActiveFilters,
  };
}
