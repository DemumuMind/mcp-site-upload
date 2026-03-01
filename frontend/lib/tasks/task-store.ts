import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

const TASKS_TABLE = "agent_tasks";

export const taskStatusValues = ["queued", "running", "done", "failed"] as const;
export type TaskStatus = (typeof taskStatusValues)[number];

const taskStatusSchema = z.enum(taskStatusValues);
const agentTaskRowSchema = z.object({
  id: z.string().min(1),
  intent: z.string(),
  constraints: z.unknown(),
  context_refs: z.unknown(),
  status: z.string(),
  delta_eta: z.string().nullable(),
  error_summary: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
  started_at: z.string().nullable(),
  finished_at: z.string().nullable(),
});
type AgentTaskRow = z.infer<typeof agentTaskRowSchema>;

export type AgentTaskRecord = {
  id: string;
  intent: string;
  constraints: string[];
  contextRefs: string[];
  status: TaskStatus;
  deltaEta: string | null;
  errorSummary: string | null;
  createdAt: string;
  updatedAt: string;
  startedAt: string | null;
  finishedAt: string | null;
};

export type CreateAgentTaskInput = {
  taskId: string;
  intent: string;
  constraints?: string[];
  contextRefs?: string[];
  status?: TaskStatus;
  deltaEta?: string | null;
};

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  return value.filter((item): item is string => typeof item === "string");
}

function toTaskStatus(value: string): TaskStatus {
  const parsed = taskStatusSchema.safeParse(value);
  if (parsed.success) {
    return parsed.data;
  }
  return "queued";
}

function mapTaskRow(row: AgentTaskRow): AgentTaskRecord {
  return {
    id: row.id,
    intent: row.intent,
    constraints: normalizeStringArray(row.constraints),
    contextRefs: normalizeStringArray(row.context_refs),
    status: toTaskStatus(row.status),
    deltaEta: row.delta_eta,
    errorSummary: row.error_summary,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    startedAt: row.started_at,
    finishedAt: row.finished_at,
  };
}

export async function createAgentTask(input: CreateAgentTaskInput): Promise<AgentTaskRecord | null> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return null;
  }

  const { data, error } = await adminClient
    .from(TASKS_TABLE)
    .insert({
      id: input.taskId,
      intent: input.intent,
      constraints: input.constraints ?? [],
      context_refs: input.contextRefs ?? [],
      status: input.status ?? "queued",
      delta_eta: input.deltaEta ?? null,
    })
    .select("id, intent, constraints, context_refs, status, delta_eta, error_summary, created_at, updated_at, started_at, finished_at")
    .single<AgentTaskRow>();

  if (error || !data) {
    return null;
  }

  const parsed = agentTaskRowSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }
  return mapTaskRow(parsed.data);
}

export async function getAgentTaskById(taskId: string): Promise<AgentTaskRecord | null> {
  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return null;
  }

  const { data, error } = await adminClient
    .from(TASKS_TABLE)
    .select("id, intent, constraints, context_refs, status, delta_eta, error_summary, created_at, updated_at, started_at, finished_at")
    .eq("id", taskId)
    .maybeSingle<AgentTaskRow>();

  if (error || !data) {
    return null;
  }

  const parsed = agentTaskRowSchema.safeParse(data);
  if (!parsed.success) {
    return null;
  }
  return mapTaskRow(parsed.data);
}
