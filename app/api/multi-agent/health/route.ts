import { NextResponse } from "next/server";
import { agentRoleSchema, pipelineStageSchema, pipelineStatusSchema, workerRoleSchema } from "@/lib/multi-agent/types";

export const dynamic = "force-dynamic";

const startedAt = Date.now();

export async function GET() {
  const uptimeMs = Date.now() - startedAt;

  return NextResponse.json({
    ok: true,
    status: "healthy",
    service: "multi-agent-pipeline",
    runtime: {
      nodeEnv: process.env.NODE_ENV ?? "unknown",
      adaptiveOrchestrationEnabled: process.env.MULTI_AGENT_ADAPTIVE_ENABLED !== "0",
      uptimeMs,
    },
    capabilities: {
      workerRoles: workerRoleSchema.options,
      agentRoles: agentRoleSchema.options,
      stages: pipelineStageSchema.options,
      statuses: pipelineStatusSchema.options,
    },
    timestamp: new Date().toISOString(),
  });
}
