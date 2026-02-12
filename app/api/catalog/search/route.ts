import { NextRequest, NextResponse } from "next/server";
import { parseCatalogQueryV2 } from "@/lib/catalog/query-v2";
import { getCatalogSnapshot } from "@/lib/catalog/snapshot";
import { runCatalogSearch } from "@/lib/catalog/server-search";
export const dynamic = "force-dynamic";
export async function GET(request: NextRequest) {
    try {
        const query = parseCatalogQueryV2(request.nextUrl.searchParams);
        const snapshot = await getCatalogSnapshot();
        const result = runCatalogSearch(snapshot.servers, query);
        return NextResponse.json(result);
    }
    catch (error) {
        const message = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({
            ok: false,
            message,
        }, { status: 500 });
    }
}
