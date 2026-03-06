import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runFullHealthCheck } from "@/lib/catalog/health";

export const dynamic = "force-dynamic";

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "Unknown catalog health-check error";
}

const handlers = withCronAuth(
  async (_request, { logger }) => {
    logger.info("catalog.health_check.start");

    try {
      const results = await runFullHealthCheck();
      logger.info("catalog.health_check.completed", { count: results?.length });

      return NextResponse.json({
        ok: true,
        checkedCount: results?.length,
        results,
      });
    } catch (error) {
      logger.error("catalog.health_check.error", { message: toErrorMessage(error) });
      return NextResponse.json(
        {
          ok: false,
          error: "Catalog health check failed.",
        },
        { status: 500 },
      );
    }
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.health_check",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
