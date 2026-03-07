import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { parseNumberEnv } from "@/lib/api/auth-helpers";
import { withCronAuth } from "@/lib/api/with-auth";
import { invalidateCatalogCaches } from "@/lib/cache/invalidation";
import { CATALOG_SYNC_ALL_LOCK_TTL_SECONDS } from "@/lib/cache/policy";
import { runCatalogIngestion } from "@/lib/catalog/ingestion";
import { executeCatalogSyncAll } from "@/lib/catalog/sync-all-core";
import { runFullHealthCheck } from "@/lib/catalog/health";
import {
  acquireCatalogSyncLock,
  finishCatalogSyncRun,
  recordCatalogSyncFailures,
  releaseCatalogSyncLock,
  startCatalogSyncRun,
} from "@/lib/catalog/sync-run-store";

export const dynamic = "force-dynamic";

const SYNC_ALL_LOCK_KEY = "catalog:sync-all";
const DEFAULT_SYNC_ALL_GITHUB_PAGES = 120;
const MAX_GITHUB_SEARCH_PAGES = 200;

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
            ttlSeconds: CATALOG_SYNC_ALL_LOCK_TTL_SECONDS,
          },
          { logger },
        ),
      startRun: () =>
        startCatalogSyncRun(
          {
            trigger: "catalog.unified_sync",
            sourceScope: ["github", "smithery", "npm", "pypi", "oci", "registry"],
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
      runSync: ({ runId }) =>
        runCatalogIngestion({
          runId,
          sourceTypes: ["github", "smithery", "npm", "pypi", "oci", "registry"],
          githubMaxPages: parseNumberEnv("CATALOG_AUTOSYNC_MAX_PAGES", DEFAULT_SYNC_ALL_GITHUB_PAGES, {
            min: 1,
            max: MAX_GITHUB_SEARCH_PAGES,
          }),
          logger,
        }),
      runHealthCheck: () => runFullHealthCheck(),
      clearCaches: async (changedSlugs) => {
        invalidateCatalogCaches({
          origin: "route",
          changedSlugs: changedSlugs.slice(0, 100),
        });
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
