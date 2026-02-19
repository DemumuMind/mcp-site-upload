import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runFullHealthCheck } from "@/lib/catalog/health";

export const dynamic = "force-dynamic";

const handlers = withCronAuth(
  async (request, { logger }) => {
    logger.info("catalog.health_check.start");
    
    try {
      const results = await runFullHealthCheck();
      logger.info("catalog.health_check.completed", { count: results?.length });
      
      return NextResponse.json({
        ok: true,
        checkedCount: results?.length,
        results
      });
    } catch (error) {
      logger.error("catalog.health_check.error", { message: (error as Error).message });
      return NextResponse.json({ ok: false, error: (error as Error).message }, { status: 500 });
    }
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET"],
  "catalog.health_check"
);

export const GET = handlers.GET;
export const POST = handlers.POST;
