import { NextResponse } from "next/server";
import { authorizeTaskApiRequest } from "@/lib/tasks/task-api-auth";
import { executeGetTaskRequest } from "@/lib/tasks/tasks-get-core";
import { getAgentTaskById } from "@/lib/tasks/task-store";

export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, context: RouteContext) {
  if (!authorizeTaskApiRequest(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized." }, { status: 401 });
  }

  const { id } = await context.params;
  const response = await executeGetTaskRequest({
    rawTaskId: id,
    getTaskById: getAgentTaskById,
  });

  return NextResponse.json(response.body, { status: response.status });
}
