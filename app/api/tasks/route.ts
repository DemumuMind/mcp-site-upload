import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAgentTask } from "@/lib/tasks/task-store";

export const dynamic = "force-dynamic";

const MAX_INTENT_LENGTH = 4000;
const MAX_ITEMS = 100;
const MAX_ITEM_LENGTH = 512;

const createTaskBodySchema = z.object({
  intent: z.string().trim().min(1).max(MAX_INTENT_LENGTH),
  constraints: z.array(z.string().trim().min(1).max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
  contextRefs: z.array(z.string().trim().min(1).max(MAX_ITEM_LENGTH)).max(MAX_ITEMS).optional(),
});

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
  }

  try {
    const input = createTaskBodySchema.parse(body);
    const taskId = crypto.randomUUID();

    const task = await createAgentTask({
      taskId,
      intent: input.intent,
      constraints: input.constraints,
      contextRefs: input.contextRefs,
      status: "queued",
    });

    if (!task) {
      return NextResponse.json({ ok: false, error: "Unable to create task." }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      taskId: task.id,
      status: task.status,
      createdAt: task.createdAt,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ ok: false, error: "Invalid request body.", details: error.issues }, { status: 400 });
    }
    return NextResponse.json({ ok: false, error: "Unable to create task." }, { status: 500 });
  }
}
