import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";

export const dynamic = "force-dynamic";

const handlers = withCronAuth(
  async (request, { logger }) => {
    try {
      logger.info("catalog.smithery_sync.start");

      const result = await runCatalogSmitherySync();

      // Сброс кэша для обновления данных на сайте
      revalidatePath("/");
      revalidatePath("/catalog");
      revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");

      for (const slug of result.changedSlugs.slice(0, 100)) {
        revalidatePath(`/server/${slug}`);
      }

      logger.info("catalog.smithery_sync.completed", {
        created: result.created,
        updated: result.updated,
        failed: result.failed
      });

      return NextResponse.json({
        ok: result.failed === 0,
        ...result
      });
    } catch (error) {
      logger.error("catalog.smithery_sync.error", {
        message: error instanceof Error ? error.message : "Unknown error"
      });

      return NextResponse.json({
        ok: false,
        error: "Internal sync error"
      }, { status: 500 });
    }
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET"],
  "catalog.smithery_sync"
);

export const GET = handlers.GET;
export const POST = handlers.POST;
