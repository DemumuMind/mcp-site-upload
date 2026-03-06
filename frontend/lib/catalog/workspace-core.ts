export type CatalogWorkspaceSearchParams = Record<string, string | string[] | undefined>;

type SearchParamsReader = Pick<URLSearchParams, "get" | "getAll">;

type CatalogSnapshotLike<TServer> = {
  servers: TServer[];
  totalServers: number;
  totalTools: number;
  totalCategories: number;
  featuredServers: TServer[];
  categoryEntries: Array<[string, number]>;
};

type CatalogQueryLike = {
  query: string;
  categories: string[];
  auth: string[];
  tags: string[];
  verification: string[];
  health: string[];
  toolsMin: number | null;
  toolsMax: number | null;
};

type CatalogSearchResultLike<TServer, TQuery extends CatalogQueryLike> = {
  items: TServer[];
  total: number;
  appliedFilters: TQuery;
  facets: {
    tagEntries: Array<[string, number]>;
  };
};

type CatalogWorkspaceCoreDeps<
  TServer,
  TQuery extends CatalogQueryLike,
  TResult extends CatalogSearchResultLike<TServer, TQuery>,
> = {
  parseQuery: (searchParams: SearchParamsReader) => TQuery;
  runSearch: (servers: TServer[], query: TQuery) => TResult;
};

export type CatalogWorkspaceCore<
  TServer,
  TQuery extends CatalogQueryLike,
  TResult extends CatalogSearchResultLike<TServer, TQuery>,
> = {
  summary: Pick<
    CatalogSnapshotLike<TServer>,
    "totalServers" | "totalTools" | "totalCategories" | "featuredServers"
  >;
  query: TQuery;
  result: TResult;
  featuredServers: TServer[];
  topCategoryEntries: Array<[string, number]>;
  topTagEntries: Array<[string, number]>;
  hasActiveFilters: boolean;
};

function toUrlSearchParams(searchParams: CatalogWorkspaceSearchParams): URLSearchParams {
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

function hasActiveCatalogFilters(query: CatalogQueryLike): boolean {
  return (
    query.query.trim().length > 0 ||
    query.categories.length > 0 ||
    query.auth.length > 0 ||
    query.tags.length > 0 ||
    query.verification.length > 0 ||
    query.health.length > 0 ||
    query.toolsMin !== null ||
    query.toolsMax !== null
  );
}

export function buildCatalogWorkspaceCore<
  TServer,
  TQuery extends CatalogQueryLike,
  TResult extends CatalogSearchResultLike<TServer, TQuery>,
>(
  snapshot: CatalogSnapshotLike<TServer>,
  searchParams: CatalogWorkspaceSearchParams,
  deps: CatalogWorkspaceCoreDeps<TServer, TQuery, TResult>,
): CatalogWorkspaceCore<TServer, TQuery, TResult> {
  const query = deps.parseQuery(toUrlSearchParams(searchParams));
  const result = deps.runSearch(snapshot.servers, query);

  return {
    summary: {
      totalServers: snapshot.totalServers,
      totalTools: snapshot.totalTools,
      totalCategories: snapshot.totalCategories,
      featuredServers: snapshot.featuredServers,
    },
    query: result.appliedFilters,
    result,
    featuredServers: snapshot.featuredServers,
    topCategoryEntries: snapshot.categoryEntries.slice(0, 4),
    topTagEntries: result.facets.tagEntries.slice(0, 6),
    hasActiveFilters: hasActiveCatalogFilters(result.appliedFilters),
  };
}
