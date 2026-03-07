import type { CatalogSyncResult } from "./ingestion.ts";

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
    published?: number;
    quarantined?: number;
    stageMetrics?: Record<string, number>;
    alertingSummary?: Record<string, unknown>;
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
  runSync: (input: { runId: string | null }) => Promise<CatalogSyncResult>;
  runHealthCheck: () => Promise<unknown>;
  clearCaches: (changedSlugs: string[]) => Promise<void>;
  logger: {
    info: (event: string, details?: Record<string, unknown>) => void;
    warn?: (event: string, details?: Record<string, unknown>) => void;
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
  let finalResult: CatalogSyncResult | null = null;
  const recordedFailures: { source: string; entityKey: string; stage: string; errorMessageSanitized: string }[] = [];

  try {
    deps.logger.info("catalog.unified_sync.start");
    const result = await deps.runSync({ runId });
    finalResult = result;

    try {
      deps.logger.info("catalog.unified_sync.health_check.start");
      await deps.runHealthCheck();
    } catch (error) {
      const message = toSyncAllErrorMessage(error, "Unknown health-check error");
      deps.logger.error("catalog.unified_sync.health_check.error", { message });
      recordedFailures.push({
        source: "health",
        entityKey: "catalog-health-check",
        stage: "health_check",
        errorMessageSanitized: message,
      });
    }

    if (result.changedSlugs.length > 0) {
      await deps.clearCaches(result.changedSlugs);
    }

    recordedFailures.push(
      ...result.failures.map((failure) => ({
        source: failure.source,
        entityKey: failure.entityKey,
        stage: failure.stage,
        errorMessageSanitized: failure.reason,
      })),
    );

    const failedProviders = Object.values(result.sources).filter((source) => (source?.failed ?? 0) > 0).length;
    const totalProviders = result.sourceTypes.length;
    const ok = failedProviders === 0 && result.failed === 0;

    if (ok) {
      finalStatus = "success";
    } else if (
      totalProviders > 0 &&
      failedProviders === totalProviders &&
      result.published === 0 &&
      result.created === 0 &&
      result.updated === 0
    ) {
      finalStatus = "error";
    } else {
      finalStatus = "partial";
    }

    if (recordedFailures.length > 0) {
      errorSummary = `${recordedFailures.length} stage failures recorded.`;
    }

    const responseStatus = finalStatus === "error" ? 500 : finalStatus === "partial" ? 207 : 200;
    const responseBody =
      finalStatus === "success"
        ? {}
        : createSyncAllErrorBody(
            finalStatus === "error"
              ? "Catalog sync-all failed across all selected sources."
              : "Catalog sync-all completed with partial source failures.",
            finalStatus === "error" ? "internal_error" : "partial_failure",
          );

    return {
      status: responseStatus,
      body: {
        ok,
        ...responseBody,
        executedAt: result.executedAt,
        summary: {
          created: result.created,
          updated: result.updated,
          published: result.published,
          quarantined: result.quarantined,
          failed: result.failed,
          staleCandidates: result.staleCandidates,
          staleMarked: result.staleMarked,
        },
        sources: result.sources,
        failures: result.failures,
        alerting: {
          status: finalStatus === "success" ? "ok" : finalStatus,
          shouldWarn: finalStatus !== "success",
          shouldPage: finalStatus === "error",
        },
      },
    };
  } catch (error) {
    const message = toSyncAllErrorMessage(error, "Catalog sync-all failed before completion.");
    errorSummary = message;
    deps.logger.error("catalog.unified_sync.unhandled_error", { message });
    return {
      status: 500,
      body: createSyncAllErrorBody("Catalog sync-all failed before completion.", "internal_error"),
    };
  } finally {
    const durationMs = (deps.now ?? Date.now)() - startedAtMs;
    if (runId) {
      await deps.finishRun({
        runId,
        status: finalStatus,
        durationMs,
        fetched: finalResult?.metricsByStage.fetched ?? 0,
        upserted: (finalResult?.created ?? 0) + (finalResult?.updated ?? 0),
        failed: finalResult?.failed ?? recordedFailures.length,
        staleMarked: finalResult?.staleMarked ?? 0,
        published: finalResult?.published ?? 0,
        quarantined: finalResult?.quarantined ?? 0,
        stageMetrics: finalResult?.metricsByStage ?? {},
        alertingSummary: {
          status: finalStatus === "success" ? "ok" : finalStatus,
          failures: recordedFailures.length,
        },
        errorSummary,
      });

      if (recordedFailures.length > 0) {
        await deps.recordFailures({
          runId,
          failures: recordedFailures,
          limit: MAX_RECORDED_FAILURES,
        });
      }
    }

    await deps.releaseLock();
  }
}
