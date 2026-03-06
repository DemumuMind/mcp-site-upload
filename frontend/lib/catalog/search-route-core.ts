type SearchParamsReader = Pick<URLSearchParams, "get" | "getAll">;

export type CatalogSearchErrorCode = "invalid_request" | "internal_error";

export type CatalogSearchErrorBody = {
  ok: false;
  error: string;
  code: CatalogSearchErrorCode;
};

type CatalogSearchResultLike = {
  items: unknown[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  facets: object;
  appliedFilters: object;
};

type CatalogSnapshotLike<TServer> = {
  servers: TServer[];
};

type ApiErrorLike = {
  message: string;
  statusCode: number;
};

type CatalogSearchRouteDeps<TServer, TQuery, TResult extends CatalogSearchResultLike> = {
  parseQuery: (searchParams: SearchParamsReader) => TQuery;
  getSnapshot: () => Promise<CatalogSnapshotLike<TServer>>;
  runSearch: (servers: TServer[], query: TQuery) => TResult;
};

type CatalogSearchRouteSuccess<TResult extends CatalogSearchResultLike> = {
  status: 200;
  body: TResult;
};

type CatalogSearchRouteFailure = {
  status: number;
  body: CatalogSearchErrorBody;
};

export type CatalogSearchRouteResult<TResult extends CatalogSearchResultLike = CatalogSearchResultLike> =
  | CatalogSearchRouteSuccess<TResult>
  | CatalogSearchRouteFailure;

function isApiErrorLike(error: unknown): error is ApiErrorLike {
  return (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as { message?: unknown }).message === "string" &&
    "statusCode" in error &&
    typeof (error as { statusCode?: unknown }).statusCode === "number"
  );
}

function classifyCatalogSearchError(error: unknown): CatalogSearchRouteFailure {
  if (isApiErrorLike(error) && error.statusCode >= 400 && error.statusCode < 500) {
    return {
      status: error.statusCode,
      body: {
        ok: false,
        error: error.message,
        code: "invalid_request",
      },
    };
  }

  if (error instanceof URIError) {
    return {
      status: 400,
      body: {
        ok: false,
        error: "Invalid catalog search request.",
        code: "invalid_request",
      },
    };
  }

  return {
    status: 500,
    body: {
      ok: false,
      error: "Catalog search failed.",
      code: "internal_error",
    },
  };
}

export async function executeCatalogSearchRequest<
  TServer,
  TQuery,
  TResult extends CatalogSearchResultLike,
>(
  searchParams: SearchParamsReader,
  deps: CatalogSearchRouteDeps<TServer, TQuery, TResult>,
): Promise<CatalogSearchRouteResult<TResult>> {
  try {
    const query = deps.parseQuery(searchParams);
    const snapshot = await deps.getSnapshot();
    const result = deps.runSearch(snapshot.servers, query);

    return {
      status: 200,
      body: result,
    };
  } catch (error) {
    return classifyCatalogSearchError(error);
  }
}
