import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createLogger } from "@/lib/api/logger";
import { runMultiAgentPipeline } from "@/lib/multi-agent/pipeline";
import { persistMultiAgentTelemetry } from "@/lib/multi-agent/telemetry";
import type { MultiAgentPipelineResult } from "@/lib/multi-agent/types";

export const dynamic = "force-dynamic";

const MAX_TASK_LENGTH = 4000;
const MAX_CONTEXT_KEYS = 30;
const MAX_CONTEXT_VALUE_LENGTH = 2000;

const requestSchema = z.object({
  task: z.string().trim().min(1).max(MAX_TASK_LENGTH),
  context: z
    .record(z.string().max(80), z.string().max(MAX_CONTEXT_VALUE_LENGTH))
    .default({})
    .refine((value) => Object.keys(value).length <= MAX_CONTEXT_KEYS, {
      message: `context may contain at most ${MAX_CONTEXT_KEYS} keys`,
    }),
});

const logger = createLogger("multi_agent.demo");

function getRequestId(request: NextRequest): string {
  return (
    request.headers.get("x-request-id") ??
    request.headers.get("x-vercel-id") ??
    crypto.randomUUID()
  );
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.MULTI_AGENT_DEMO_SECRET?.trim();
  if (!secret) {
    return true;
  }

  const auth = request.headers.get("authorization") ?? "";
  return auth === `Bearer ${secret}`;
}

function isPipelineResult(value: unknown): value is MultiAgentPipelineResult {
  if (!value || typeof value !== "object") {
    return false;
  }
  return "metrics" in value && "budget" in value;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const startedAt = Date.now();

  try {
    if (!isAuthorized(request)) {
      return NextResponse.json(
        {
          ok: false,
          error: "Unauthorized",
          requestId,
        },
        { status: 401 },
      );
    }

    const json = await request.json();
    const input = requestSchema.parse(json);

    const pipelineOutput = await runMultiAgentPipeline(input);

    const result =
      pipelineOutput && typeof pipelineOutput === "object" && "result" in pipelineOutput
        ? pipelineOutput.result
        : pipelineOutput;

    const log =
      pipelineOutput && typeof pipelineOutput === "object" && "log" in pipelineOutput
        ? pipelineOutput.log
        : result && typeof result === "object" && "logs" in result
          ? result.logs
          : [];

    const durationMs = Date.now() - startedAt;

    if (isPipelineResult(result)) {
      try {
        await persistMultiAgentTelemetry({
          requestId,
          durationMs,
          pipeline: result,
        });
      } catch (telemetryError) {
        const telemetryMessage = telemetryError instanceof Error ? telemetryError.message : "Unknown telemetry error";
        logger.error("telemetry_error", { requestId, message: telemetryMessage });
      }
    }

    return NextResponse.json({
      ok: true,
      result,
      log,
      requestId,
      meta: {
        durationMs,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      logger.warn("validation_error", { requestId, issues: error.issues.length });
      return NextResponse.json(
        {
          ok: false,
          error: "Invalid request body",
          details: error.issues,
          requestId,
        },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    logger.error("unhandled_error", { requestId, message });

    return NextResponse.json(
      {
        ok: false,
        error: message,
        requestId,
      },
      { status: 500 },
    );
  }
}
