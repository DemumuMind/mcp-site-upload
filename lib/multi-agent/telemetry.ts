import type { MultiAgentPipelineResult } from "@/lib/multi-agent/types";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type PipelineTelemetryInput = {
  requestId: string;
  durationMs: number;
  pipeline: MultiAgentPipelineResult;
};

function getSloDurationMs(): number {
  const raw = process.env.MULTI_AGENT_SLO_DURATION_MS?.trim();
  const parsed = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 2500;
  }
  return Math.trunc(parsed);
}

function getSloMaxRetries(): number {
  const raw = process.env.MULTI_AGENT_SLO_MAX_RETRIES?.trim();
  const parsed = raw ? Number(raw) : Number.NaN;
  if (!Number.isFinite(parsed) || parsed < 0) {
    return 0;
  }
  return Math.trunc(parsed);
}

function getAlertWebhookUrl(): string | null {
  const value = process.env.MULTI_AGENT_ALERT_WEBHOOK_URL?.trim();
  return value && value.length > 0 ? value : null;
}

export async function persistMultiAgentTelemetry(input: PipelineTelemetryInput): Promise<void> {
  const admin = createSupabaseAdminClient();
  if (!admin) {
    return;
  }

  const { pipeline, requestId, durationMs } = input;
  const { metrics, budget } = pipeline;

  await admin.from("multi_agent_pipeline_runs").insert({
    request_id: requestId,
    task: pipeline.input.task,
    context_size: Object.keys(pipeline.input.context).length,
    active_workers: metrics.activeWorkers,
    coordination_mode: metrics.coordinationMode,
    duration_ms: durationMs,
    total_duration_ms: metrics.totalDurationMs,
    initial_duration_ms: metrics.stageDurationsMs.initial,
    exchange_duration_ms: metrics.stageDurationsMs.exchange,
    final_duration_ms: metrics.stageDurationsMs.final,
    estimated_tokens: metrics.estimatedTokens,
    estimated_cost_usd: metrics.estimatedCostUsd,
    log_entries: metrics.logEntries,
    feedback_count: metrics.feedbackCount,
    initial_retries: metrics.initialRetries,
    within_budget: budget.withinBudget,
    max_estimated_tokens: budget.maxEstimatedTokens,
  });

  const shouldAlertLatency = durationMs > getSloDurationMs();
  const shouldAlertBudget = !budget.withinBudget;
  const shouldAlertRetries = metrics.initialRetries > getSloMaxRetries();

  if (!shouldAlertLatency && !shouldAlertBudget && !shouldAlertRetries) {
    return;
  }

  const reasons = [
    shouldAlertLatency ? `duration=${durationMs}ms` : null,
    shouldAlertBudget ? `budget_exceeded tokens=${metrics.estimatedTokens}` : null,
    shouldAlertRetries ? `retries=${metrics.initialRetries}` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const warningMessage = `Multi-agent SLO warning (${requestId}): ${reasons}`;

  await admin.from("admin_system_events").insert({
    level: "warning",
    message_en: warningMessage,
    message_secondary: warningMessage,
  });

  const webhookUrl = getAlertWebhookUrl();
  if (!webhookUrl) {
    return;
  }

  await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      event: "multi_agent_slo_warning",
      requestId,
      reasons,
      durationMs,
      estimatedTokens: metrics.estimatedTokens,
      initialRetries: metrics.initialRetries,
      withinBudget: budget.withinBudget,
    }),
  });
}
