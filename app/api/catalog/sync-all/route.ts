import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runCatalogGithubSync, type CatalogSyncResult } from "@/lib/catalog/github-sync";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import { runCatalogNpmSync } from "@/lib/catalog/npm-sync";
import { runFullHealthCheck } from "@/lib/catalog/health";
import { CATALOG_SERVERS_CACHE_TAG } from "@/lib/catalog/snapshot";

export const dynamic = "force-dynamic";

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

function getMetricValue(source: UnifiedSourceResult | undefined, metric: "created" | "updated" | "failed"): number {
  if (!source || "error" in source) {
    return 0;
  }
  return source[metric];
}

function hasSourceError(source: UnifiedSourceResult | undefined): boolean {
  return Boolean(source && "error" in source);
}

const handlers = withCronAuth(
  async (request, { logger }) => {
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

    logger.info("catalog.unified_sync.completed", summary);

    return NextResponse.json({
      ok,
      executedAt,
      sources: results,
      summary
    } as UnifiedSyncResult);
  },
  ["CATALOG_AUTOSYNC_CRON_SECRET"],
  "catalog.unified_sync"
);

export const GET = handlers.GET;
export const POST = handlers.POST;
