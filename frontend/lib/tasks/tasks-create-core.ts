import { z } from "zod";
import type { CreateAgentTaskInput, TaskStoreResult } from "./task-store";

const MAX_INTENT_LENGTH = 4000;
const MAX_ITEMS = 100;
const MAX_ITEM_LENGTH = 512;

export const createTaskBodySchema = z.object({
  intent: z.string().trim().min(1).max(MAX_INTENT_LENGTH),
  constraints: z.array(z.string().trim().min(1).max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
  contextRefs: z.array(z.string().trim().min(1).max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
});

type TaskCreateDeps = {
  parseJsonBody: () => Promise<unknown>;
  createTask: (input: CreateAgentTaskInput) => Promise<TaskStoreResult<{
    id: string;
    status: string;
    createdAt: string;
  }>>;
  createTaskId: () => string;
};

export async function executeCreateTaskRequest(deps: TaskCreateDeps): Promise<{
  status: number;
  body: Record<string, unknown>;
}> {
  let body: unknown;
  try {
    body = await deps.parseJsonBody();
  } catch {
    return {
      status: 400,
      body: { ok: false, error: "Invalid JSON payload." },
    };
  }

  try {
    const input = createTaskBodySchema.parse(body);
    const storeResult = await deps.createTask({
      taskId: deps.createTaskId(),
      intent: input.intent,
      constraints: input.constraints,
      contextRefs: input.contextRefs,
      status: "queued",
    });

    if (!storeResult.ok) {
      return {
        status: 500,
        body: { ok: false, error: "Unable to create task." },
      };
    }

    return {
      status: 200,
      body: {
        ok: true,
        taskId: storeResult.data.id,
        status: storeResult.data.status,
        createdAt: storeResult.data.createdAt,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        status: 400,
        body: { ok: false, error: "Invalid request body.", details: error.issues },
      };
    }

    return {
      status: 500,
      body: { ok: false, error: "Unable to create task." },
    };
  }
}
