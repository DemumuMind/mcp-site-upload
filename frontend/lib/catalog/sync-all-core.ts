import type { CatalogSyncResult } from "./github-sync";

type UnifiedSourceResult = CatalogSyncResult | { error: string };

export type SyncAllFinalStatus = "success" | "partial" | "error";

type SyncAllErrorBody = {
  ok: false;
  error: string;
  code: "already_running" | "partial_failure" | "internal_error";
};

type SyncAllLockResult = {
  acquired: boolean;
  lockedUntil?: string;
};

type SyncAllDeps = {
  lockKey: string;
  acquireLock: () => Promise<SyncAllLockResult>;
  startRun: () => Promise<string | null>;
  finishRun: (input: {
    runId: string;
    status: SyncAllFinalStatus;
    durationMs: number;
    fetched?: number;
    upserted?: number;
    failed?: number;
    staleMarked?: number;
    errorSummary?: string;
  }) => Promise<void>;
  recordFailures: (input: {
    runId: string;
    failures: {
      source: string;
      entityKey: string;
      stage: string;
      errorMessageSanitized: string;
    }[];
    limit: number;
  }) => Promise<void>;
  releaseLock: () => Promise<void>;
  runGithubSync: () => Promise<CatalogSyncResult>;
  runSmitherySync: () => Promise<CatalogSyncResult>;
  runNpmSync: () => Promise<CatalogSyncResult>;
  runHealthCheck: () => Promise<unknown>;
  clearCaches: (changedSlugs: string[]) => Promise<void>;
  logger: {
    info: (event: string, details?: Record<string, unknown>) => void;
    error: (event: string, details?: Record<string, unknown>) => void;
  };
  now?: () => number;
};

function createSyncAllErrorBody(
  error: string,
  code: SyncAllErrorBody["code"],
): SyncAllErrorBody {
  return {
    ok: false,
    error,
    code,
  };
}

function toSyncAllErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return fallback;
}

function getMetricValue(
  source: UnifiedSourceResult | undefined,
  metric: "created" | "updated" | "failed",
): number {
  if (!source || "error" in source) {
    return 0;
  }
  return source[metric];
}

function hasSourceError(source: UnifiedSourceResult | undefined): boolean {
  return Boolean(source && "error" in source);
}

function toSourceFailures(
  source: string,
  result: UnifiedSourceResult | undefined,
): { source: string; entityKey: string; stage: string; errorMessageSanitized: string }[] {
  if (!result) {
    return [];
  }
  if ("error" in result) {
    return [{ source, entityKey: source, stage: "sync", errorMessageSanitized: result.error }];
  }
  return result.failures.map((failure) => ({
    source,
    entityKey: failure.slug,
    stage: "upsert",
    errorMessageSanitized: failure.reason,
  }));
}

const MAX_RECORDED_FAILURES = 200;

export async function executeCatalogSyncAll(
  deps: SyncAllDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const startedAtMs = (deps.now ?? Date.now)();
  const lock = await deps.acquireLock();

  if (!lock.acquired) {
    return {
      status: 409,
      body: {
        ...createSyncAllErrorBody("Catalog sync-all is already running.", "already_running"),
        lock: {
          key: deps.lockKey,
          lockedUntil: lock.lockedUntil ?? null,
        },
      },
    };
  }

  const runId = await deps.startRun();
  let finalStatus: SyncAllFinalStatus = "error";
  let errorSummary: string | undefined;
  let counters: Record<string, number> = {};
  let failures: { source: string; entityKey: string; stage: string; errorMessageSanitized: string }[] = [];

  try {
    deps.logger.info("catalog.unified_sync.start");

    const executedAt = new Date().toISOString();
    const changedSlugs = new Set<string>();
    const results: {
      github?: UnifiedSourceResult;
      smithery?: UnifiedSourceResult;
      npm?: UnifiedSourceResult;
    } = {};

    try {
      deps.logger.info("catalog.unified_sync.github.start");
      const githubResult = await deps.runGithubSync();
      results.github = githubResult;
      githubResult.changedSlugs.forEach((slug) => changedSlugs.add(slug));
    } catch (error) {
      const message = toSyncAllErrorMessage(error, "Unknown GitHub sync error");
      deps.logger.error("catalog.unified_sync.github.error", { message });
      results.github = { error: message };
    }

    try {
      deps.logger.info("catalog.unified_sync.smithery.start");
      const smitheryResult = await deps.runSmitherySync();
      results.smithery = smitheryResult;
      smitheryResult.changedSlugs.forEach((slug) => changedSlugs.add(slug));
    } catch (error) {
      const message = toSyncAllErrorMessage(error, "Unknown Smithery sync error");
      deps.logger.error("catalog.unified_sync.smithery.error", { message });
      results.smithery = { error: message };
    }

    try {
      deps.logger.info("catalog.unified_sync.npm.start");
      const npmResult = await deps.runNpmSync();
      results.npm = npmResult;
      npmResult.changedSlugs.forEach((slug) => changedSlugs.add(slug));
    } catch (error) {
      const message = toSyncAllErrorMessage(error, "Unknown npm sync error");
      deps.logger.error("catalog.unified_sync.npm.error", { message });
      results.npm = { error: message };
    }

    try {
      deps.logger.info("catalog.unified_sync.health_check.start");
      await deps.runHealthCheck();
    } catch (error) {
      deps.logger.error("catalog.unified_sync.health_check.error", {
        message: toSyncAllErrorMessage(error, "Unknown health-check error"),
      });
    }

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

    if (changedSlugs.size > 0) {
      await deps.clearCaches(Array.from(changedSlugs));
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

    deps.logger.info("catalog.unified_sync.completed", summary);

    const errorBody = ok
      ? {}
      : createSyncAllErrorBody(
          sourceErrors.length === 3
            ? "Catalog sync-all failed across all sources."
            : "Catalog sync-all completed with partial source failures.",
          sourceErrors.length === 3 ? "internal_error" : "partial_failure",
        );

    return {
      status: finalStatus === "error" ? 500 : finalStatus === "partial" ? 207 : 200,
      body: {
        ok,
        ...errorBody,
        executedAt,
        sources: results,
        summary,
      },
    };
  } finally {
    const durationMs = (deps.now ?? Date.now)() - startedAtMs;
    if (runId) {
      await deps.finishRun({
        runId,
        status: finalStatus,
        durationMs,
        fetched: (counters.totalCreated ?? 0) + (counters.totalUpdated ?? 0) + (counters.totalFailed ?? 0),
        upserted: (counters.totalCreated ?? 0) + (counters.totalUpdated ?? 0),
        failed: counters.totalFailed,
        staleMarked: 0,
        errorSummary,
      });

      if (failures.length > 0) {
        await deps.recordFailures({
          runId,
          failures,
          limit: MAX_RECORDED_FAILURES,
        });
      }
    }

    await deps.releaseLock();
  }
}
