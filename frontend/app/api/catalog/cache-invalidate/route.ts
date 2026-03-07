import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { invalidateCatalogCaches } from "@/lib/cache/invalidation";
import { executeCatalogCacheInvalidate } from "@/lib/catalog/cache-invalidate-core";

export const dynamic = "force-dynamic";

const handlers = withCronAuth(
  async (request: NextRequest) => {
    const response = await executeCatalogCacheInvalidate({
      parseJsonBody: () => request.json(),
      invalidate: ({ changedSlugs, includeAdmin }) => {
        invalidateCatalogCaches({
          origin: "route",
          changedSlugs,
          includeAdmin,
        });
      },
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.cache_invalidate",
);

export const POST = handlers.POST;
