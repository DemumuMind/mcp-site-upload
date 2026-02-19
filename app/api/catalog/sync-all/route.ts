import { revalidatePath, revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { withCronAuth } from "@/lib/api/with-auth";
import { runCatalogGithubSync, type CatalogSyncResult } from "@/lib/catalog/github-sync";
import { runCatalogSmitherySync } from "@/lib/catalog/smithery-sync";
import { runCatalogNpmSync } from "@/lib/catalog/npm-sync";
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

const handlers = withCronAuth(
  async (request, { logger }) => {
    logger.info("catalog.unified_sync.start");

    const executedAt = new Date().toISOString();
    const changedSlugs = new Set<string>();

    // Результаты по источникам
    const results: any = {};

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

    // Подсчет итогов
    const summary = {
      totalCreated: (results.github?.created || 0) + (results.smithery?.created || 0) + (results.npm?.created || 0),
      totalUpdated: (results.github?.updated || 0) + (results.smithery?.updated || 0) + (results.npm?.updated || 0),
      totalFailed: (results.github?.failed || 0) + (results.smithery?.failed || 0) + (results.npm?.failed || 0),
    };

    // Инвалидация кэша
    if (changedSlugs.size > 0) {
      revalidatePath("/");
      revalidatePath("/catalog");
      revalidatePath("/categories");
      revalidateTag(CATALOG_SERVERS_CACHE_TAG);

      // Ограничиваем количество ревалидаций путей серверов для производительности
      const slugsToRevalidate = Array.from(changedSlugs).slice(0, 100);
      for (const slug of slugsToRevalidate) {
        revalidatePath(`/server/${slug}`);
      }
    }

    const ok = !results.github?.error && !results.smithery?.error && !results.npm?.error && summary.totalFailed === 0;

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
