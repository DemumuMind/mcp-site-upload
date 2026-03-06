import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { parseNumber, parseNumberEnv } from "@/lib/api/auth-helpers";
import { withCronAuth } from "@/lib/api/with-auth";
import { executeCatalogAutoSync } from "@/lib/catalog/auto-sync-core";
import { runCatalogGithubSync } from "@/lib/catalog/github-sync";
import { CATALOG_SERVERS_CACHE_TAG, clearCatalogSnapshotRedisCache } from "@/lib/catalog/snapshot";
import {
  acquireCatalogSyncLock,
  finishCatalogSyncRun,
  recordCatalogSyncFailures,
  releaseCatalogSyncLock,
  startCatalogSyncRun,
} from "@/lib/catalog/sync-run-store";

export const dynamic = "force-dynamic";

const DEFAULT_MAX_PAGES = 120;
const MAX_GITHUB_SEARCH_PAGES = 200;
const AUTO_SYNC_LOCK_KEY = "catalog:auto-sync";
const AUTO_SYNC_LOCK_TTL_SECONDS = 15 * 60;

const handlers = withCronAuth(
  async (request: NextRequest, { logger }) => {
    const lockHolderId = randomUUID();
    const response = await executeCatalogAutoSync({
      requestPages: request.nextUrl.searchParams.get("pages"),
      lockKey: AUTO_SYNC_LOCK_KEY,
      holderId: lockHolderId,
      acquireLock: () =>
        acquireCatalogSyncLock(
          {
            lockKey: AUTO_SYNC_LOCK_KEY,
            holderId: lockHolderId,
            ttlSeconds: AUTO_SYNC_LOCK_TTL_SECONDS,
          },
          { logger },
        ),
      startRun: () =>
        startCatalogSyncRun(
          {
            trigger: "catalog.auto_sync",
            sourceScope: ["github"],
          },
          { logger },
        ),
      finishRun: (input) => finishCatalogSyncRun(input, { logger }),
      recordFailures: (input) => recordCatalogSyncFailures(input, { logger }),
      releaseLock: () =>
        releaseCatalogSyncLock(
          {
            lockKey: AUTO_SYNC_LOCK_KEY,
            holderId: lockHolderId,
          },
          { logger },
        ),
      parseEnvMaxPages: () =>
        parseNumberEnv("CATALOG_AUTOSYNC_MAX_PAGES", DEFAULT_MAX_PAGES, {
          min: 1,
          max: MAX_GITHUB_SEARCH_PAGES,
        }),
      parseMaxPages: (value, fallback) =>
        parseNumber(value, fallback, {
          min: 1,
          max: MAX_GITHUB_SEARCH_PAGES,
        }),
      runSync: ({ maxPages }) => runCatalogGithubSync({ maxPages }),
      clearCaches: async (result) => {
        revalidatePath("/");
        revalidatePath("/catalog");
        revalidatePath("/categories");
        revalidatePath("/sitemap.xml");
        await clearCatalogSnapshotRedisCache();
        for (const slug of result.changedSlugs.slice(0, 400)) {
          revalidatePath(`/server/${slug}`);
        }
        revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");
      },
      logger,
      nodeEnv: process.env.NODE_ENV,
    });

    return NextResponse.json(response.body, { status: response.status });
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.auto_sync",
);

export const GET = handlers.GET;
export const POST = handlers.POST;
