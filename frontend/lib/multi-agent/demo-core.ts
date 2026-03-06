import { z } from "zod";
import type { MultiAgentTaskEventStatus, MultiAgentTaskEventType } from "./task-events";
import type { MultiAgentPipelineResult } from "./types";

const MAX_TASK_LENGTH = 4000;
const MAX_CONTEXT_KEYS = 30;
const MAX_CONTEXT_VALUE_LENGTH = 2000;

export const multiAgentDemoRequestSchema = z.object({
  task: z.string().trim().min(1).max(MAX_TASK_LENGTH),
  context: z
    .record(z.string().max(80), z.string().max(MAX_CONTEXT_VALUE_LENGTH))
    .default({})
    .refine((value) => Object.keys(value).length <= MAX_CONTEXT_KEYS, {
      message: `context may contain at most ${MAX_CONTEXT_KEYS} keys`,
    }),
});

type DemoCoreDeps = {
  requestId: string;
  rateLimit: {
    allowed: boolean;
    resetAt: number;
  };
  isAuthorized: boolean;
  parseJsonBody: () => Promise<unknown>;
  runPipeline: (
    input: z.infer<typeof multiAgentDemoRequestSchema>,
    context: { requestId: string },
  ) => Promise<unknown>;
  persistTelemetry: (input: {
    requestId: string;
    durationMs: number;
    pipeline: MultiAgentPipelineResult;
  }) => Promise<void>;
  emitEvent: (input: {
    requestId: string;
    eventType: MultiAgentTaskEventType;
    status: MultiAgentTaskEventStatus;
    stage: string;
    payload?: Record<string, unknown>;
  }) => Promise<void>;
  logger: {
    warn: (event: string, payload?: Record<string, unknown>) => void;
    error: (event: string, payload?: Record<string, unknown>) => void;
  };
  now?: () => number;
};

function isPipelineResult(value: unknown): value is MultiAgentPipelineResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "metrics" in value && "budget" in value;
}

export async function executeMultiAgentDemo(
  deps: DemoCoreDeps,
): Promise<{ status: number; body: Record<string, unknown> }> {
  const startedAt = (deps.now ?? Date.now)();

  try {
    await deps.emitEvent({
      requestId: deps.requestId,
      eventType: "task_received",
      status: "started",
      stage: "validation",
      payload: {},
    });

    if (!deps.isAuthorized) {
      await deps.emitEvent({
        requestId: deps.requestId,
        eventType: "task_failed",
        status: "failed",
        stage: "validation",
        payload: {
          reason: "unauthorized",
        },
      });

      return {
        status: 401,
        body: {
          ok: false,
          error: "Unauthorized",
          requestId: deps.requestId,
        },
      };
    }

    if (!deps.rateLimit.allowed) {
      return {
        status: 429,
        body: {
          ok: false,
          error: "Too Many Requests",
          requestId: deps.requestId,
          retryAfterMs: Math.max(0, deps.rateLimit.resetAt - (deps.now ?? Date.now)()),
        },
      };
    }

    const json = await deps.parseJsonBody();
    const input = multiAgentDemoRequestSchema.parse(json);

    await deps.emitEvent({
      requestId: deps.requestId,
      eventType: "task_received",
      status: "success",
      stage: "validation",
      payload: {
        taskLength: input.task.length,
        contextSize: Object.keys(input.context).length,
      },
    });

    const pipelineOutput = await deps.runPipeline(input, { requestId: deps.requestId });
    const result =
      pipelineOutput && typeof pipelineOutput === "object" && "result" in pipelineOutput
        ? (pipelineOutput as { result: unknown }).result
        : pipelineOutput;

    const log =
      pipelineOutput && typeof pipelineOutput === "object" && "log" in pipelineOutput
        ? (pipelineOutput as { log: unknown }).log
        : result && typeof result === "object" && "logs" in result
          ? (result as { logs: unknown }).logs
          : [];

    const durationMs = (deps.now ?? Date.now)() - startedAt;

    if (isPipelineResult(result)) {
      try {
        await deps.persistTelemetry({
          requestId: deps.requestId,
          durationMs,
          pipeline: result,
        });
      } catch (telemetryError) {
        const telemetryMessage =
          telemetryError instanceof Error ? telemetryError.message : "Unknown telemetry error";
        deps.logger.error("telemetry_error", { requestId: deps.requestId, message: telemetryMessage });
        await deps.emitEvent({
          requestId: deps.requestId,
          eventType: "task_failed",
          status: "failed",
          stage: "telemetry",
          payload: {
            reason: "persist_multi_agent_telemetry_failed",
            message: telemetryMessage,
          },
        });
      }
    }

    await deps.emitEvent({
      requestId: deps.requestId,
      eventType: "task_completed",
      status: "success",
      stage: "execution",
      payload: {
        durationMs,
        hasPipelineResult: isPipelineResult(result),
        logEntries: Array.isArray(log) ? log.length : 0,
      },
    });

    return {
      status: 200,
      body: {
        ok: true,
        result,
        log,
        requestId: deps.requestId,
        meta: {
          durationMs,
        },
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      deps.logger.warn("validation_error", { requestId: deps.requestId, issues: error.issues.length });
      await deps.emitEvent({
        requestId: deps.requestId,
        eventType: "task_failed",
        status: "failed",
        stage: "validation",
        payload: {
          reason: "invalid_request_body",
          issues: error.issues.length,
        },
      });

      return {
        status: 400,
        body: {
          ok: false,
          error: "Invalid request body",
          details: error.issues,
          requestId: deps.requestId,
        },
      };
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    deps.logger.error("unhandled_error", { requestId: deps.requestId, message });
    await deps.emitEvent({
      requestId: deps.requestId,
      eventType: "task_failed",
      status: "failed",
      stage: "execution",
      payload: {
        reason: "unhandled_error",
        message,
      },
    });

    return {
      status: 500,
      body: {
        ok: false,
        error: message,
        requestId: deps.requestId,
      },
    };
  }
}
