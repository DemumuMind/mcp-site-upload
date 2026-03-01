import { NextResponse } from "next/server";
import { getAgentTaskById } from "@/lib/tasks/task-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;
  const taskId = id.trim();
  if (!taskId) {
    return NextResponse.json({ ok: false, error: "Task id is required." }, { status: 400 });
  }

  const task = await getAgentTaskById(taskId);
  if (!task) {
    return NextResponse.json({ ok: false, error: "Task not found." }, { status: 404 });
  }

  const durationMs =
    task.startedAt && task.finishedAt
      ? Math.max(0, new Date(task.finishedAt).getTime() - new Date(task.startedAt).getTime())
      : null;

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
