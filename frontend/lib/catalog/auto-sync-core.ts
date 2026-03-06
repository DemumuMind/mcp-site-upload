import type { CatalogSyncResult } from "./github-sync";

export type AutoSyncAlertSignal = {
  code: string;
  severity: "info" | "warning" | "error";
  message: string;
  value?: number;
  threshold?: number;
};

export type AutoSyncAlerting = {
  status: "ok" | "partial" | "error";
  shouldWarn: boolean;
  shouldPage: boolean;
  signalCount: number;
  signals: AutoSyncAlertSignal[];
};

export type AutoSyncFinalStatus = "success" | "partial" | "error";

type AutoSyncErrorBody = {
  ok: false;
  error: string;
  code: "already_running" | "partial_failure" | "internal_error";
};

type AutoSyncLockResult = {
  acquired: boolean;
  lockedUntil?: string;
};

type AutoSyncDeps = {
  requestPages: string | null;
  lockKey: string;
  holderId: string;
  acquireLock: () => Promise<AutoSyncLockResult>;
  startRun: () => Promise<string | null>;
  finishRun: (input: {
    runId: string;
    status: AutoSyncFinalStatus;
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
  parseEnvMaxPages: () => number;
  parseMaxPages: (value: string | null, fallback: number) => number;
  runSync: (input: { maxPages: number }) => Promise<CatalogSyncResult>;
  clearCaches: (result: CatalogSyncResult) => Promise<void>;
  logger: {
    warn: (event: string, details?: Record<string, unknown>) => void;
    error: (event: string, details?: Record<string, unknown>) => void;
  };
  now?: () => number;
  delay?: (ms: number) => Promise<void>;
  nodeEnv?: string;
};

const NETWORK_RETRY_ATTEMPTS = 3;
const NETWORK_RETRY_DELAY_MS = 1500;
const MAX_RECORDED_FAILURES = 200;

function toErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }
  return "Unexpected auto-sync error";
}

function createAutoSyncErrorBody(
  error: string,
  code: AutoSyncErrorBody["code"],
): AutoSyncErrorBody {
  return {
    ok: false,
    error,
    code,
  };
}

function isNetworkFetchFailure(error: unknown): boolean {
  const message = toErrorMessage(error).toLowerCase();
  if (message.includes("fetch failed") || message.includes("econn") || message.includes("etimedout")) {
    return true;
  }
  if (error instanceof Error && "cause" in error) {
    const cause = (error as { cause?: unknown }).cause;
    if (cause && typeof cause === "object") {
      const causeCode = String((cause as { code?: unknown }).code ?? "").toUpperCase();
      return causeCode.startsWith("ECONN") || causeCode === "ETIMEDOUT" || causeCode === "ENOTFOUND";
    }
  }
  return false;
}

function buildAlertingSignals(result: CatalogSyncResult): AutoSyncAlerting {
  const signals: AutoSyncAlertSignal[] = [];
  if (result.failed > 0) {
    signals.push({
      code: "SYNC_FAILURES",
      severity: "error",
      message: "Sync finished with failures. Inspect failures[] for details.",
      value: result.failed,
      threshold: 0,
    });
  }
  if (result.staleCleanupEnabled && !result.staleCleanupApplied) {
    signals.push({
      code: "STALE_CLEANUP_SKIPPED",
      severity: "warning",
      message: result.staleCleanupReason ?? "Stale cleanup skipped.",
    });
  }
  if (result.staleCappedCount > 0) {
    signals.push({
      code: "STALE_CLEANUP_CAPPED",
      severity: "warning",
      message: "Stale cleanup deferred candidates due to per-run cap.",
      value: result.staleCappedCount,
      threshold: 0,
    });
  }
  if (
    typeof result.staleCoverageRatio === "number" &&
    result.staleCoverageRatio < result.minStaleBaselineRatio
  ) {
    signals.push({
      code: "LOW_STALE_COVERAGE_RATIO",
      severity: "warning",
      message: "Fetched coverage is below stale cleanup safety threshold.",
      value: result.staleCoverageRatio,
      threshold: result.minStaleBaselineRatio,
    });
  }
  const hasError = signals.some((signal) => signal.severity === "error");
  const hasWarning = signals.some((signal) => signal.severity === "warning");
  return {
    status: hasError ? "error" : hasWarning ? "partial" : "ok",
    shouldWarn: hasWarning || hasError,
    shouldPage: hasError,
    signalCount: signals.length,
    signals,
  };
}

function toRunStatus(status: AutoSyncAlerting["status"]): AutoSyncFinalStatus {
  return status === "ok" ? "success" : status;
}

function toResultCounters(result: CatalogSyncResult): Record<string, number> {
  return {
    created: result.created,
    updated: result.updated,
    failed: result.failed,
    fetchedRecords: result.fetchedRecords,
  };
}

function withCronError(
  body: AutoSyncErrorBody,
  extra: Record<string, unknown>,
  status: number,
): { status: number; body: AutoSyncErrorBody & Record<string, unknown> } {
  return {
    status,
    body: {
      ...body,
      ...extra,
    },
  };
}

export async function executeCatalogAutoSync(
  deps: AutoSyncDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const startedAtMs = (deps.now ?? Date.now)();
  const delay = deps.delay ?? ((ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms)));
  const lock = await deps.acquireLock();

  if (!lock.acquired) {
    return {
      status: 409,
      body: {
        ...createAutoSyncErrorBody("Catalog auto-sync is already running.", "already_running"),
        lock: {
          key: deps.lockKey,
          lockedUntil: lock.lockedUntil ?? null,
        },
      },
    };
  }

  const runId = await deps.startRun();
  let finalStatus: AutoSyncFinalStatus = "error";
  let finalCounters: Record<string, number> = {};
  let errorSummary: string | undefined;
  let failureRows: { source: string; entityKey: string; stage: string; errorMessageSanitized: string }[] = [];

  try {
    const envMaxPages = deps.parseEnvMaxPages();
    const maxPages = deps.parseMaxPages(deps.requestPages, envMaxPages);

    let result: CatalogSyncResult | null = null;
    let lastError: unknown = null;

    for (let attempt = 1; attempt <= NETWORK_RETRY_ATTEMPTS; attempt += 1) {
      try {
        result = await deps.runSync({ maxPages });
        lastError = null;
        break;
      } catch (error) {
        lastError = error;
        const retryable = isNetworkFetchFailure(error);
        deps.logger.warn("catalog.auto_sync.retry", {
          attempt,
          maxAttempts: NETWORK_RETRY_ATTEMPTS,
          retryable,
          message: toErrorMessage(error),
        });
        if (!retryable || attempt >= NETWORK_RETRY_ATTEMPTS) {
          break;
        }
        await delay(NETWORK_RETRY_DELAY_MS * attempt);
      }
    }

    if (!result) {
      const error = lastError ?? new Error("Catalog auto-sync failed before completion.");
      const errorMessage = toErrorMessage(error);
      errorSummary = errorMessage;
      deps.logger.error("catalog.auto_sync.unhandled_error", {
        message: errorMessage,
      });

      const debug =
        deps.nodeEnv === "production"
          ? undefined
          : {
              message: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            };

      if (isNetworkFetchFailure(error)) {
        finalStatus = "partial";
        return withCronError(
          createAutoSyncErrorBody(
            "Catalog auto-sync partially unavailable due to GitHub network failure.",
            "partial_failure",
          ),
          {
            debug,
            alerting: {
              status: "partial",
              shouldWarn: true,
              shouldPage: false,
              signalCount: 1,
              signals: [
                {
                  code: "SYNC_NETWORK_FAILURE",
                  severity: "warning",
                  message: errorMessage,
                },
              ],
            } satisfies AutoSyncAlerting,
          },
          207,
        );
      }

      finalStatus = "error";
      return withCronError(
        createAutoSyncErrorBody("Catalog auto-sync failed before completion.", "internal_error"),
        {
          debug,
          alerting: {
            status: "error",
            shouldWarn: true,
            shouldPage: true,
            signalCount: 1,
            signals: [
              {
                code: "SYNC_UNHANDLED_ERROR",
                severity: "error",
                message: "Catalog auto-sync failed before completion.",
              },
            ],
          } satisfies AutoSyncAlerting,
        },
        500,
      );
    }

    const alerting = buildAlertingSignals(result);
    finalStatus = toRunStatus(alerting.status);
    finalCounters = toResultCounters(result);
    failureRows = result.failures.map((failure) => ({
      source: "github",
      entityKey: failure.slug,
      stage: "upsert",
      errorMessageSanitized: failure.reason,
    }));

    if (result.failed > 0) {
      errorSummary = `Sync completed with ${result.failed} failures.`;
    }

    if (alerting.shouldPage) {
      deps.logger.error("catalog.auto_sync.completed", {
        alertStatus: alerting.status,
        failed: result.failed,
        signals: alerting.signals,
      });
    } else if (alerting.shouldWarn) {
      deps.logger.warn("catalog.auto_sync.completed", {
        alertStatus: alerting.status,
        failed: result.failed,
        signals: alerting.signals,
      });
    }

    await deps.clearCaches(result);

    return {
      status: alerting.status === "error" ? 207 : 200,
      body: {
        ok: alerting.status === "ok",
        ...result,
        alerting,
        safety: {
          coverage: {
            ratio: result.staleCoverageRatio,
            minRequiredRatio: result.minStaleBaselineRatio,
            baselineCount: result.staleBaselineCount,
          },
          staleCap: {
            maxPerRunRatio: result.maxStaleMarkRatio,
            totalCandidates: result.staleCandidates,
            deferredCount: result.staleCappedCount,
            processedCount: result.staleCandidates - result.staleCappedCount,
          },
          graceMode: {
            markedAsCandidates: result.staleGraceMarked,
            rejectedAfterGrace: result.staleRejectedAfterGrace,
          },
        },
        settings: {
          source: "github",
          maxPages,
        },
      },
    };
  } finally {
    const durationMs = (deps.now ?? Date.now)() - startedAtMs;
    if (runId) {
      await deps.finishRun({
        runId,
        status: finalStatus,
        durationMs,
        fetched: finalCounters.fetchedRecords,
        upserted: (finalCounters.created ?? 0) + (finalCounters.updated ?? 0),
        failed: finalCounters.failed,
        staleMarked: 0,
        errorSummary,
      });

      if (failureRows.length > 0) {
        await deps.recordFailures({
          runId,
          failures: failureRows,
          limit: MAX_RECORDED_FAILURES,
        });
      }
    }

    await deps.releaseLock();
  }
}
