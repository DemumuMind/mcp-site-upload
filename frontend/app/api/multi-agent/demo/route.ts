import { NextRequest, NextResponse } from "next/server";
import { extractBearerToken, validateCronToken } from "@/lib/api/auth-helpers";
import { createLogger } from "@/lib/api/logger";
import { RATE_LIMITS, checkRateLimit } from "@/lib/api/rate-limiter";
import { executeMultiAgentDemo } from "@/lib/multi-agent/demo-core";
import { runMultiAgentPipeline } from "@/lib/multi-agent/pipeline";
import { emitMultiAgentTaskEvent } from "@/lib/multi-agent/task-events";
import { persistMultiAgentTelemetry } from "@/lib/multi-agent/telemetry";

export const dynamic = "force-dynamic";

const logger = createLogger("multi_agent.demo");

function getRequestId(request: NextRequest): string {
  return request.headers.get("x-request-id") ?? request.headers.get("x-vercel-id") ?? crypto.randomUUID();
}

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.MULTI_AGENT_DEMO_SECRET?.trim();
  if (!secret) {
    return process.env.NODE_ENV === "development";
  }

  const providedToken = extractBearerToken(request);
  if (!providedToken) {
    return false;
  }

  return validateCronToken(providedToken, secret);
}

function getRateLimitKey(request: NextRequest): string {
  const forwardedFor = request.headers.get("x-forwarded-for");
  const clientIp = forwardedFor?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
  return `multi-agent-demo:${clientIp}`;
}

export async function POST(request: NextRequest) {
  const requestId = getRequestId(request);
  const response = await executeMultiAgentDemo({
    requestId,
    rateLimit: checkRateLimit(getRateLimitKey(request), RATE_LIMITS.public),
    isAuthorized: isAuthorized(request),
    parseJsonBody: () => request.json(),
    runPipeline: runMultiAgentPipeline,
    persistTelemetry: persistMultiAgentTelemetry,
    emitEvent: emitMultiAgentTaskEvent,
    logger,
  });

  return NextResponse.json(response.body, { status: response.status });
}
