import { NextRequest, NextResponse } from "next/server";
import { parseCatalogQueryV2 } from "@/lib/catalog/query-v2";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { runCatalogSearch } from "@/lib/catalog/server-search";
export const dynamic = "force-dynamic";

const NO_STORE_HEADERS = {
    "Cache-Control": "no-store, no-cache, must-revalidate",
};

export async function GET(request: NextRequest) {
    try {
        const query = parseCatalogQueryV2(request.nextUrl.searchParams);
        const snapshot = await getCatalogSnapshot({ bypassCache: true });
        const result = runCatalogSearch(snapshot.servers, query);
        return NextResponse.json(result, {
            headers: NO_STORE_HEADERS,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            ok: false,
            message,
        }, {
            status: 500,
            headers: NO_STORE_HEADERS,
        });
    }
}
