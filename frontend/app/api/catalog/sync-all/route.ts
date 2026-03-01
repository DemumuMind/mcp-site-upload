import { randomUUID } from "node:crypto";
import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runCatalogGithubSync, type CatalogSyncResult } from "@/lib/catalog/github-sync";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import { runCatalogNpmSync } from "@/lib/catalog/npm-sync";
import { runFullHealthCheck } from "@/lib/catalog/health";
import { CATALOG_SERVERS_CACHE_TAG, clearCatalogSnapshotRedisCache } from "@/lib/catalog/snapshot";
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
const MAX_RECORDED_FAILURES = 200;

type UnifiedSyncResult = {
  ok: boolean;
  executedAt: string;
  sources: {
    github: CatalogSyncResult | { error: string };
    smithery: CatalogSyncResult | { error: string };
    npm: CatalogSyncResult | { error: string };
  };
  summary: {
    totalCreated: number;
    totalUpdated: number;
    totalFailed: number;
  };
};

type UnifiedSourceResult = CatalogSyncResult | { error: string };

type SyncAllFinalStatus = "success" | "partial" | "error";

function getMetricValue(source: UnifiedSourceResult | undefined, metric: "created" | "updated" | "failed"): number {
  if (!source || "error" in source) {
    return 0;
  }
  return source[metric];
}

function hasSourceError(source: UnifiedSourceResult | undefined): boolean {
  return Boolean(source && "error" in source);
}

function toSourceFailures(source: string, result: UnifiedSourceResult | undefined): { source: string; entityKey: string; stage: string; reason: string }[] {
  if (!result) {
    return [];
  }
  if ("error" in result) {
    return [{ source, entityKey: source, stage: "sync", reason: result.error }];
  }
  return result.failures.map((failure) => ({
    source,
    entityKey: failure.slug,
    stage: "upsert",
    reason: failure.reason,
  }));
}

const handlers = withCronAuth(
  async (_request, { logger }) => {
    const startedAtMs = Date.now();
    const lockHolderId = randomUUID();
    const lock = await acquireCatalogSyncLock(
      {
        lockKey: SYNC_ALL_LOCK_KEY,
        holderId: lockHolderId,
        ttlSeconds: SYNC_ALL_LOCK_TTL_SECONDS,
      },
      { logger },
    );

    if (!lock.acquired) {
      return NextResponse.json({
        ok: false,
        error: "Catalog sync-all is already running.",
        lock: {
          key: SYNC_ALL_LOCK_KEY,
          lockedUntil: lock.lockedUntil ?? null,
        },
      }, { status: 409 });
    }

    const runId = await startCatalogSyncRun(
      {
        trigger: "catalog.unified_sync",
        sourceScope: ["github", "smithery", "npm"],
      },
      { logger },
    );

    let finalStatus: SyncAllFinalStatus = "error";
    let errorSummary: string | undefined;
    let counters: Record<string, number> = {};
    let failures: { source: string; entityKey: string; stage: string; reason: string }[] = [];

    try {
    logger.info("catalog.unified_sync.start");

    const executedAt = new Date().toISOString();
    const changedSlugs = new Set<string>();

    // Результаты по источникам
    const results: {
      github?: UnifiedSourceResult;
      smithery?: UnifiedSourceResult;
      npm?: UnifiedSourceResult;
    } = {};

    // 1. GitHub Sync
    try {
      logger.info("catalog.unified_sync.github.start");
      const githubResult = await runCatalogGithubSync({ maxPages: 5 });
      results.github = githubResult;
      githubResult.changedSlugs.forEach(slug => changedSlugs.add(slug));
    } catch (error) {
      logger.error("catalog.unified_sync.github.error", { message: (error as Error).message });
      results.github = { error: (error as Error).message };
    }

    // 2. Smithery Sync
    try {
      logger.info("catalog.unified_sync.smithery.start");
      const smitheryResult = await runCatalogSmitherySync();
      results.smithery = smitheryResult;
      smitheryResult.changedSlugs.forEach(slug => changedSlugs.add(slug));
    } catch (error) {
      logger.error("catalog.unified_sync.smithery.error", { message: (error as Error).message });
      results.smithery = { error: (error as Error).message };
    }

    // 3. NPM Sync
    try {
      logger.info("catalog.unified_sync.npm.start");
      const npmResult = await runCatalogNpmSync();
      results.npm = npmResult;
      npmResult.changedSlugs.forEach(slug => changedSlugs.add(slug));
    } catch (error) {
      logger.error("catalog.unified_sync.npm.error", { message: (error as Error).message });
      results.npm = { error: (error as Error).message };
    }

    // 4. Health Check
    try {
      logger.info("catalog.unified_sync.health_check.start");
      await runFullHealthCheck();
    } catch (error) {
      logger.error("catalog.unified_sync.health_check.error", { message: (error as Error).message });
    }

    // Подсчет итогов
    const summary = {
      totalCreated:
        getMetricValue(results.github, "created") +
        getMetricValue(results.smithery, "created") +
        getMetricValue(results.npm, "created"),
      totalUpdated:
        getMetricValue(results.github, "updated") +
        getMetricValue(results.smithery, "updated") +
        getMetricValue(results.npm, "updated"),
      totalFailed:
        getMetricValue(results.github, "failed") +
        getMetricValue(results.smithery, "failed") +
        getMetricValue(results.npm, "failed"),
    };

    // Инвалидация кэша
    if (changedSlugs.size > 0) {
      await clearCatalogSnapshotRedisCache();
      revalidatePath("/", "layout");
      revalidatePath("/catalog", "page");
      revalidatePath("/categories", "page");
      revalidateTag(CATALOG_SERVERS_CACHE_TAG, "max");

      // Ограничиваем количество ревалидаций путей серверов для производительности
      const slugsToRevalidate = Array.from(changedSlugs).slice(0, 100);
      for (const slug of slugsToRevalidate) {
        revalidatePath(`/server/${slug}`, "page");
      }
    }

    const ok =
      !hasSourceError(results.github) &&
      !hasSourceError(results.smithery) &&
      !hasSourceError(results.npm) &&
      summary.totalFailed === 0;

    const sourceErrors = [
      hasSourceError(results.github) ? "github" : null,
      hasSourceError(results.smithery) ? "smithery" : null,
      hasSourceError(results.npm) ? "npm" : null,
    ].filter((value): value is string => Boolean(value));

    if (ok) {
      finalStatus = "success";
    } else if (sourceErrors.length === 3) {
      finalStatus = "error";
    } else {
      finalStatus = "partial";
    }

    if (sourceErrors.length > 0) {
      errorSummary = `Source errors: ${sourceErrors.join(", ")}.`;
    }

    counters = {
      githubCreated: getMetricValue(results.github, "created"),
      githubUpdated: getMetricValue(results.github, "updated"),
      githubFailed: getMetricValue(results.github, "failed"),
      smitheryCreated: getMetricValue(results.smithery, "created"),
      smitheryUpdated: getMetricValue(results.smithery, "updated"),
      smitheryFailed: getMetricValue(results.smithery, "failed"),
      npmCreated: getMetricValue(results.npm, "created"),
      npmUpdated: getMetricValue(results.npm, "updated"),
      npmFailed: getMetricValue(results.npm, "failed"),
      totalCreated: summary.totalCreated,
      totalUpdated: summary.totalUpdated,
      totalFailed: summary.totalFailed,
    };

    failures = [
      ...toSourceFailures("github", results.github),
      ...toSourceFailures("smithery", results.smithery),
      ...toSourceFailures("npm", results.npm),
    ];

    logger.info("catalog.unified_sync.completed", summary);

    return NextResponse.json({
      ok,
      executedAt,
      sources: results,
      summary
    } as UnifiedSyncResult);
    } finally {
      const durationMs = Date.now() - startedAtMs;
      if (runId) {
        await finishCatalogSyncRun(
          {
            runId,
            status: finalStatus,
            durationMs,
            fetched: (counters.totalCreated ?? 0) + (counters.totalUpdated ?? 0) + (counters.totalFailed ?? 0),
            upserted: (counters.totalCreated ?? 0) + (counters.totalUpdated ?? 0),
            failed: counters.totalFailed,
            staleMarked: 0,
            errorSummary,
          },
          { logger },
        );

        if (failures.length > 0) {
          await recordCatalogSyncFailures(
            {
              runId,
              failures: failures.map((failure) => ({
                source: failure.source,
                entityKey: failure.entityKey,
                stage: failure.stage,
                errorMessageSanitized: failure.reason,
              })),
              limit: MAX_RECORDED_FAILURES,
            },
            { logger },
          );
        }
      }

      await releaseCatalogSyncLock(
        {
          lockKey: SYNC_ALL_LOCK_KEY,
          holderId: lockHolderId,
        },
        { logger },
      );
    }
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET", "CRON_SECRET"],
  "catalog.unified_sync"
);

export const GET = handlers.GET;
export const POST = handlers.POST;
