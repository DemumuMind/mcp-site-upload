import type { CatalogSyncResult } from "./ingestion.ts";

export type GithubWebhookWorkerFinalStatus = "success" | "partial" | "error";

type GithubWebhookWorkerDeps = {
  lockKey: string;
  acquireLock: () => Promise<{ acquired: boolean; lockedUntil?: string }>;
  startRun: () => Promise<string | null>;
  finishRun: (input: {
    runId: string;
    status: GithubWebhookWorkerFinalStatus;
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
  getQueuedDeliveryCount: () => Promise<number>;
  runSync: (input: { runId: string | null }) => Promise<CatalogSyncResult>;
  clearCaches: (changedSlugs: string[]) => Promise<void>;
  logger: {
    info: (event: string, details?: Record<string, unknown>) => void;
    warn: (event: string, details?: Record<string, unknown>) => void;
    error: (event: string, details?: Record<string, unknown>) => void;
  };
  now?: () => number;
};

const MAX_RECORDED_FAILURES = 200;

export async function executeCatalogGithubWebhookWorker(
  deps: GithubWebhookWorkerDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const startedAtMs = (deps.now ?? Date.now)();
  const queuedCount = await deps.getQueuedDeliveryCount();

  if (queuedCount === 0) {
    return {
      status: 200,
      body: {
        ok: true,
        queuedCount: 0,
        processed: 0,
        skipped: true,
      },
    };
  }

  const lock = await deps.acquireLock();
  if (!lock.acquired) {
    return {
      status: 409,
      body: {
        ok: false,
        error: "Catalog GitHub webhook worker is already running.",
        code: "already_running",
        lock: {
          key: deps.lockKey,
          lockedUntil: lock.lockedUntil ?? null,
        },
      },
    };
  }

  const runId = await deps.startRun();
  let finalStatus: GithubWebhookWorkerFinalStatus = "error";
  let result: CatalogSyncResult | null = null;
  let errorSummary: string | undefined;
  const failureRows: Array<{ source: string; entityKey: string; stage: string; errorMessageSanitized: string }> = [];

  try {
    result = await deps.runSync({ runId });
    if (result.changedSlugs.length > 0) {
      await deps.clearCaches(result.changedSlugs);
    }

    failureRows.push(
      ...result.failures.map((failure) => ({
        source: failure.source,
        entityKey: failure.entityKey,
        stage: failure.stage,
        errorMessageSanitized: failure.reason,
      })),
    );

    finalStatus = result.failed > 0 ? "partial" : "success";
    if (result.failed > 0) {
      errorSummary = `${result.failed} failures while processing queued GitHub deliveries.`;
    }

    return {
      status: finalStatus === "success" ? 200 : 207,
      body: {
        ok: finalStatus === "success",
        queuedCount,
        processed: result.published + result.quarantined + result.rejected,
        changedSlugs: result.changedSlugs,
        failures: result.failures,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "GitHub webhook worker failed.";
    errorSummary = message;
    deps.logger.error("catalog.github_webhook_worker.error", { message });
    return {
      status: 500,
      body: {
        ok: false,
        error: "Catalog GitHub webhook worker failed.",
        code: "internal_error",
      },
    };
  } finally {
    const durationMs = (deps.now ?? Date.now)() - startedAtMs;
    if (runId) {
      await deps.finishRun({
        runId,
        status: finalStatus,
        durationMs,
        fetched: result?.metricsByStage.fetched ?? 0,
        upserted: (result?.created ?? 0) + (result?.updated ?? 0),
        failed: result?.failed ?? failureRows.length,
        staleMarked: result?.staleMarked ?? 0,
        published: result?.published ?? 0,
        quarantined: result?.quarantined ?? 0,
        stageMetrics: result?.metricsByStage ?? {},
        alertingSummary: {
          queueMode: true,
          queuedCount,
          failures: failureRows.length,
        },
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
