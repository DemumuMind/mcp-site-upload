import { NextResponse } from "next/server";
import { authorizeTaskApiRequest } from "@/lib/tasks/task-api-auth";
import { getAgentTaskById } from "@/lib/tasks/task-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function toDurationMs(startedAt: string | null, finishedAt: string | null): number | null {
  if (!startedAt || !finishedAt) {
    return null;
  }

  return Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime());
}

export async function GET(request: Request, context: RouteContext) {
  if (!authorizeTaskApiRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const taskId = id.trim();
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Task id is required." }, { status: 400 });
  }

  const task = await getAgentTaskById(taskId);
  if (!task) {
    return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });
  }

  const durationMs = toDurationMs(task.startedAt, task.finishedAt);
  return NextResponse.json({
    ok: true,
    id: task.id,
    status: task.status,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    durationMs,
    errorSummary: task.errorSummary,
    deltaEta: task.deltaEta,
    intent: task.intent,
    constraints: task.constraints,
    contextRefs: task.contextRefs,
  });
}
