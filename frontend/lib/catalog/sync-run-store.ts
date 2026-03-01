import type { Logger } from "@/lib/api/logger";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const RUNS_TABLE = "catalog_sync_runs";
const FAILURES_TABLE = "catalog_sync_failures";
const LOCKS_TABLE = "catalog_sync_locks";

type StoreContext = {
  logger?: Logger;
};

export type CatalogRunStatus = "running" | "success" | "partial" | "error";

type AcquireLockInput = {
  lockKey: string;
  holderId: string;
  ttlSeconds: number;
};

type ReleaseLockInput = {
  lockKey: string;
  holderId: string;
};

type StartRunInput = {
  trigger: string;
  sourceScope: string[];
};

type FinishRunInput = {
  runId: string;
  status: Exclude<CatalogRunStatus, "running">;
  durationMs: number;
  fetched?: number;
  upserted?: number;
  failed?: number;
  staleMarked?: number;
  errorSummary?: string;
};

export type CatalogSyncFailureInput = {
  source: string;
  entityKey: string;
  stage: string;
  errorCode?: string;
  errorMessageSanitized: string;
  payloadHash?: string;
};

type RecordFailuresInput = {
  runId: string;
  failures: CatalogSyncFailureInput[];
  limit?: number;
};

export type CatalogSyncRunRow = {
  id: string;
  trigger: string | null;
  status: string | null;
  startedAt: string | null;
  finishedAt: string | null;
  fetched: number;
  upserted: number;
  failed: number;
  staleMarked: number;
  durationMs: number | null;
  errorSummary: string | null;
};

export type CatalogSyncLockRow = {
  lockKey: string;
  holderId: string;
  lockedUntil: string;
};

export type StoreReadResult<T> = {
  degraded: boolean;
  data: T;
};

export type AcquireLockResult = {
  acquired: boolean;
  lockedUntil?: string;
  degraded: boolean;
};

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function logWarn(context: StoreContext, event: string, details: Record<string, unknown>): void {
  context.logger?.warn(event, details);
}

function safeNumber(value: number | undefined): number {
  if (typeof value !== "number" || Number.isNaN(value) || value < 0) {
    return 0;
  }
  return Math.floor(value);
}

export async function acquireCatalogSyncLock(
  input: AcquireLockInput,
  context: StoreContext = {},
): Promise<AcquireLockResult> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { acquired: true, degraded: true };
  }

  const now = new Date();
  const nowIso = now.toISOString();
  const lockedUntil = new Date(now.getTime() + input.ttlSeconds * 1000).toISOString();

  try {
    const { data: existing, error: readError } = await adminClient
      .from(LOCKS_TABLE)
      .select("lock_key, holder_id, locked_until")
      .eq("lock_key", input.lockKey)
      .maybeSingle();

    if (readError) {
      logWarn(context, "catalog.sync_store.lock.read_error", {
        lockKey: input.lockKey,
        message: readError.message,
      });
      return { acquired: true, degraded: true };
    }

    const existingUntil = typeof existing?.locked_until === "string" ? existing.locked_until : null;
    const existingHolder = typeof existing?.holder_id === "string" ? existing.holder_id : null;

    if (existingUntil && Date.parse(existingUntil) > now.getTime() && existingHolder !== input.holderId) {
      return { acquired: false, lockedUntil: existingUntil, degraded: false };
    }

    const payload = {
      lock_key: input.lockKey,
      holder_id: input.holderId,
      locked_until: lockedUntil,
    };

    const { error: upsertError } = await adminClient
      .from(LOCKS_TABLE)
      .upsert(payload, { onConflict: "lock_key" });

    if (upsertError) {
      logWarn(context, "catalog.sync_store.lock.upsert_error", {
        lockKey: input.lockKey,
        message: upsertError.message,
      });
      return { acquired: true, degraded: true };
    }

    const { data: verify, error: verifyError } = await adminClient
      .from(LOCKS_TABLE)
      .select("holder_id, locked_until")
      .eq("lock_key", input.lockKey)
      .maybeSingle();

    if (verifyError) {
      logWarn(context, "catalog.sync_store.lock.verify_error", {
        lockKey: input.lockKey,
        message: verifyError.message,
      });
      return { acquired: true, degraded: true, lockedUntil };
    }

    const verifyHolder = typeof verify?.holder_id === "string" ? verify.holder_id : null;
    const verifyUntil = typeof verify?.locked_until === "string" ? verify.locked_until : lockedUntil;
    const acquired = verifyHolder === input.holderId && Date.parse(verifyUntil) > Date.parse(nowIso);

    return { acquired, lockedUntil: verifyUntil, degraded: false };
  } catch (error) {
    logWarn(context, "catalog.sync_store.lock.acquire_exception", {
      lockKey: input.lockKey,
      message: getErrorMessage(error),
    });
    return { acquired: true, degraded: true };
  }
}

export async function releaseCatalogSyncLock(
  input: ReleaseLockInput,
  context: StoreContext = {},
): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return;
  }

  try {
    const { error } = await adminClient
      .from(LOCKS_TABLE)
      .update({ locked_until: new Date().toISOString() })
      .eq("lock_key", input.lockKey)
      .eq("holder_id", input.holderId);

    if (error) {
      logWarn(context, "catalog.sync_store.lock.release_error", {
        lockKey: input.lockKey,
        message: error.message,
      });
    }
  } catch (error) {
    logWarn(context, "catalog.sync_store.lock.release_exception", {
      lockKey: input.lockKey,
      message: getErrorMessage(error),
    });
  }
}

export async function startCatalogSyncRun(
  input: StartRunInput,
  context: StoreContext = {},
): Promise<string | null> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return null;
  }

  try {
    const { data, error } = await adminClient
      .from(RUNS_TABLE)
      .insert({
        trigger: input.trigger,
        status: "running",
        source_scope: input.sourceScope,
      })
      .select("id")
      .maybeSingle();

    if (error) {
      logWarn(context, "catalog.sync_store.run.start_error", {
        trigger: input.trigger,
        message: error.message,
      });
      return null;
    }

    return typeof data?.id === "string" ? data.id : null;
  } catch (error) {
    logWarn(context, "catalog.sync_store.run.start_exception", {
      trigger: input.trigger,
      message: getErrorMessage(error),
    });
    return null;
  }
}

export async function finishCatalogSyncRun(
  input: FinishRunInput,
  context: StoreContext = {},
): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return;
  }

  try {
    const { error } = await adminClient
      .from(RUNS_TABLE)
      .update({
        status: input.status,
        finished_at: new Date().toISOString(),
        duration_ms: safeNumber(input.durationMs),
        fetched: safeNumber(input.fetched),
        upserted: safeNumber(input.upserted),
        failed: safeNumber(input.failed),
        stale_marked: safeNumber(input.staleMarked),
        error_summary: input.errorSummary ?? null,
      })
      .eq("id", input.runId);

    if (error) {
      logWarn(context, "catalog.sync_store.run.finish_error", {
        runId: input.runId,
        message: error.message,
      });
    }
  } catch (error) {
    logWarn(context, "catalog.sync_store.run.finish_exception", {
      runId: input.runId,
      message: getErrorMessage(error),
    });
  }
}

export async function recordCatalogSyncFailures(
  input: RecordFailuresInput,
  context: StoreContext = {},
): Promise<void> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient || input.failures.length === 0) {
    return;
  }

  const boundedLimit = Math.max(1, Math.min(input.limit ?? 200, 1000));
  const rows = input.failures.slice(0, boundedLimit).map((failure) => ({
    run_id: input.runId,
    source: failure.source,
    entity_key: failure.entityKey,
    stage: failure.stage,
    error_code: failure.errorCode ?? null,
    error_message_sanitized: failure.errorMessageSanitized,
    payload_hash: failure.payloadHash ?? null,
  }));

  try {
    const { error } = await adminClient.from(FAILURES_TABLE).insert(rows);
    if (error) {
      logWarn(context, "catalog.sync_store.failures.insert_error", {
        runId: input.runId,
        message: error.message,
        rows: rows.length,
      });
    }
  } catch (error) {
    logWarn(context, "catalog.sync_store.failures.insert_exception", {
      runId: input.runId,
      message: getErrorMessage(error),
      rows: rows.length,
    });
  }
}

export async function getRecentCatalogSyncRuns(
  limit = 10,
  context: StoreContext = {},
): Promise<StoreReadResult<CatalogSyncRunRow[]>> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { degraded: true, data: [] };
  }

  try {
    const boundedLimit = Math.max(1, Math.min(limit, 50));
    const { data, error } = await adminClient
      .from(RUNS_TABLE)
      .select("id, trigger, status, started_at, finished_at, fetched, upserted, failed, stale_marked, duration_ms, error_summary")
      .order("started_at", { ascending: false })
      .limit(boundedLimit);

    if (error) {
      logWarn(context, "catalog.sync_store.runs.read_error", { message: error.message });
      return { degraded: true, data: [] };
    }

    const rows = (data ?? []).map((row) => ({
      id: row.id,
      trigger: row.trigger,
      status: row.status,
      startedAt: row.started_at,
      finishedAt: row.finished_at,
      fetched: row.fetched ?? 0,
      upserted: row.upserted ?? 0,
      failed: row.failed ?? 0,
      staleMarked: row.stale_marked ?? 0,
      durationMs: row.duration_ms,
      errorSummary: row.error_summary,
    }));

    return { degraded: false, data: rows };
  } catch (error) {
    logWarn(context, "catalog.sync_store.runs.read_exception", { message: getErrorMessage(error) });
    return { degraded: true, data: [] };
  }
}

export async function getActiveCatalogSyncLocks(
  context: StoreContext = {},
): Promise<StoreReadResult<CatalogSyncLockRow[]>> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return { degraded: true, data: [] };
  }

  try {
    const { data, error } = await adminClient
      .from(LOCKS_TABLE)
      .select("lock_key, holder_id, locked_until")
      .gt("locked_until", new Date().toISOString())
      .order("locked_until", { ascending: false });

    if (error) {
      logWarn(context, "catalog.sync_store.locks.read_error", { message: error.message });
      return { degraded: true, data: [] };
    }

    return {
      degraded: false,
      data: (data ?? []).map((row) => ({
        lockKey: row.lock_key,
        holderId: row.holder_id,
        lockedUntil: row.locked_until,
      })),
    };
  } catch (error) {
    logWarn(context, "catalog.sync_store.locks.read_exception", { message: getErrorMessage(error) });
    return { degraded: true, data: [] };
  }
}
