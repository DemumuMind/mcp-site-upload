import { parseCatalogQueryV2 } from "./query-v2.ts";
import { runCatalogSearch } from "./server-search.ts";
import { getCatalogSnapshot, type CatalogSnapshot } from "./snapshot.ts";
import type { CatalogQueryV2, CatalogSearchResult } from "./types.ts";

export type CatalogPageSearchParams = Record<string, string | string[] | undefined>;

export type CatalogPageSummary = Pick<
  CatalogSnapshot,
  "totalServers" | "totalTools" | "totalCategories" | "featuredServers"
>;

export type CatalogPageViewModel = {
  summary: CatalogPageSummary;
  initialQuery: CatalogQueryV2;
  initialResult: CatalogSearchResult;
};

function toUrlSearchParams(searchParams: CatalogPageSearchParams): URLSearchParams {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "undefined") {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        params.append(key, entry);
      }
      continue;
    }

    params.set(key, value);
  }

  return params;
}

function buildCatalogPageSummary(snapshot: CatalogSnapshot): CatalogPageSummary {
  return {
    totalServers: snapshot.totalServers,
    totalTools: snapshot.totalTools,
    totalCategories: snapshot.totalCategories,
    featuredServers: snapshot.featuredServers,
  };
}

export function buildCatalogPageViewModel(
  snapshot: CatalogSnapshot,
  searchParams: CatalogPageSearchParams = {},
): CatalogPageViewModel {
  const initialQuery = parseCatalogQueryV2(toUrlSearchParams(searchParams));
  const initialResult = runCatalogSearch(snapshot.servers, initialQuery);

  return {
    summary: buildCatalogPageSummary(snapshot),
    initialQuery,
    initialResult,
  };
}

export async function getCatalogPageViewModel(
  searchParams: CatalogPageSearchParams = {},
): Promise<CatalogPageViewModel> {
  const snapshot = await getCatalogSnapshot();
  return buildCatalogPageViewModel(snapshot, searchParams);
}
