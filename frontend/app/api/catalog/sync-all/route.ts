import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { executeCatalogSyncAll } from "@/lib/catalog/sync-all-core";
import { runCatalogGithubSync } from "@/lib/catalog/github-sync";
import { runFullHealthCheck } from "@/lib/catalog/health";
import { runCatalogNpmSync } from "@/lib/catalog/npm-sync";
import { CATALOG_SERVERS_CACHE_TAG, clearCatalogSnapshotRedisCache } from "@/lib/catalog/snapshot";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import {
  acquireCatalogSyncLock,
  finishCatalogSyncRun,
  recordCatalogSyncFailures,
  releaseCatalogSyncLock,
  startCatalogSyncRun,
} from "@/lib/catalog/sync-run-store";

export const dynamic = "force-dynamic";

const SYNC_ALL_LOCK_KEY = "catalog:sync-all";
const SYNC_ALL_LOCK_TTL_SECONDS = 30 * 60;

const handlers = withCronAuth(
  async (_request, { logger }) => {
    const lockHolderId = randomUUID();
    const response = await executeCatalogSyncAll({
      lockKey: SYNC_ALL_LOCK_KEY,
      acquireLock: () =>
        acquireCatalogSyncLock(
          {
            lockKey: SYNC_ALL_LOCK_KEY,
            holderId: lockHolderId,
            ttlSeconds: SYNC_ALL_LOCK_TTL_SECONDS,
          },
          { logger },
        ),
      startRun: () =>
        startCatalogSyncRun(
          {
            trigger: "catalog.unified_sync",
            sourceScope: ["github", "smithery", "npm"],
          },
          { logger },
        ),
      finishRun: (input) => finishCatalogSyncRun(input, { logger }),
      recordFailures: (input) => recordCatalogSyncFailures(input, { logger }),
      releaseLock: () =>
        releaseCatalogSyncLock(
          {
            lockKey: SYNC_ALL_LOCK_KEY,
            holderId: lockHolderId,
          },
          { logger },
        ),
      runGithubSync: () => runCatalogGithubSync({ maxPages: 5 }),
      runSmitherySync: () => runCatalogSmitherySync(),
      runNpmSync: () => runCatalogNpmSync(),
      runHealthCheck: () => runFullHealthCheck(),
      clearCaches: async (changedSlugs) => {
        await clearCatalogSnapshotRedisCache();
        revalidatePath("/", "layout");
        revalidatePath("/catalog", "page");
        revalidatePath("/categories", "page");
        revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");

        for (const slug of changedSlugs.slice(0, 100)) {
          revalidatePath(`/server/${slug}`, "page");
        }
      },
      logger,
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.unified_sync",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
