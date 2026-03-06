import type { TaskStoreResult } from "./task-store";

type TaskGetDeps = {
  rawTaskId: string;
  getTaskById: (taskId: string) => Promise<TaskStoreResult<{
    id: string;
    status: string;
    startedAt: string | null;
    finishedAt: string | null;
    errorSummary: string | null;
    deltaEta: string | null;
    intent: string;
    constraints: string[];
    contextRefs: string[];
  }>>;
};

function toDurationMs(startedAt: string | null, finishedAt: string | null): number | null {
  if (!startedAt || !finishedAt) {
    return null;
  }

  return Math.max(0, new Date(finishedAt).getTime() - new Date(startedAt).getTime());
}

export async function executeGetTaskRequest(deps: TaskGetDeps): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  const taskId = deps.rawTaskId.trim();
  if (!taskId) {
    return {
      status: 400,
      body: { ok: false, error: "Task id is required." },
    };
  }

  const storeResult = await deps.getTaskById(taskId);
  if (!storeResult.ok) {
    if (storeResult.reason === "not_found") {
      return {
        status: 404,
        body: { ok: false, error: "Task not found." },
      };
    }

    return {
      status: 500,
      body: { ok: false, error: "Unable to load task." },
    };
  }

  const task = storeResult.data;
  return {
    status: 200,
    body: {
      ok: true,
      id: task.id,
      status: task.status,
      startedAt: task.startedAt,
      finishedAt: task.finishedAt,
      durationMs: toDurationMs(task.startedAt, task.finishedAt),
      errorSummary: task.errorSummary,
      deltaEta: task.deltaEta,
      intent: task.intent,
      constraints: task.constraints,
      contextRefs: task.contextRefs,
    },
  };
}
