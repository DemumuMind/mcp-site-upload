import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { executeCatalogHealthCheck } from "@/lib/catalog/health-check-core";
import { runFullHealthCheck } from "@/lib/catalog/health";

export const dynamic = "force-dynamic";

const handlers = withCronAuth(
  async (_request, { logger }) => {
    const response = await executeCatalogHealthCheck({
      runHealthCheck: runFullHealthCheck,
      logInfo: (event, details) => logger.info(event, details),
      logError: (event, details) => logger.error(event, details),
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.health_check",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
