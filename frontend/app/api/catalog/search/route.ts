import { NextRequest, NextResponse } from "next/server";
import { buildCacheControlHeader } from "@/lib/cache/policy";
import {
  classifyCatalogSearchError,
} from "@/lib/catalog/search-route-core";
import {
  getCatalogWorkspace,
  type CatalogPageSearchParams,
} from "@/lib/catalog/workspace";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
    "Cache-Control": buildCacheControlHeader("apiNoStore"),
};

function toCatalogPageSearchParams(searchParams: URLSearchParams): CatalogPageSearchParams {
  const result: CatalogPageSearchParams = {};

  for (const [key, value] of searchParams.entries()) {
    const existingValue = result[key];

    if (typeof existingValue === "undefined") {
      result[key] = value;
      continue;
    }

    if (Array.isArray(existingValue)) {
      existingValue.push(value);
      continue;
    }

    result[key] = [existingValue, value];
  }

  return result;
}

export async function GET(request: NextRequest) {
  try {
    const workspace = await getCatalogWorkspace(toCatalogPageSearchParams(request.nextUrl.searchParams));

    return NextResponse.json(workspace.result, {
      status: 200,
      headers: NO_STORE_HEADERS,
    });
  } catch (error) {
    const failure = classifyCatalogSearchError(error);

    return NextResponse.json(failure.body, {
      status: failure.status,
      headers: NO_STORE_HEADERS,
    });
  }
}
