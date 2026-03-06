import { NextRequest, NextResponse } from "next/server";
import { authorizeTaskApiRequest } from "@/lib/tasks/task-api-auth";
import { executeCreateTaskRequest } from "@/lib/tasks/tasks-create-core";
import { createAgentTask } from "@/lib/tasks/task-store";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  if (!authorizeTaskApiRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const response = await executeCreateTaskRequest({
    parseJsonBody: () => request.json(),
    createTask: createAgentTask,
    createTaskId: () => crypto.randomUUID(),
  });

  return NextResponse.json(response.body, { status: response.status });
}
