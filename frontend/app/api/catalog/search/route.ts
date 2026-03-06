import { NextRequest, NextResponse } from "next/server";
import { buildCacheControlHeader } from "@/lib/cache/policy";
import { parseCatalogQueryV2 } from "@/lib/catalog/query-v2";
import { executeCatalogSearchRequest } from "@/lib/catalog/search-route-core";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { runCatalogSearch } from "@/lib/catalog/server-search";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
    "Cache-Control": buildCacheControlHeader("apiNoStore"),
};

export async function GET(request: NextRequest) {
  const response = await executeCatalogSearchRequest(request.nextUrl.searchParams, {
    parseQuery: parseCatalogQueryV2,
    getSnapshot: () => getCatalogSnapshot(),
    runSearch: runCatalogSearch,
  });

  return NextResponse.json(response.body, {
    status: response.status,
    headers: NO_STORE_HEADERS,
  });
}
