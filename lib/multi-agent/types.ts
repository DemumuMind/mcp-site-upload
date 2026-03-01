import { z } from "zod";

export const workerRoleSchema = z.enum(["analyst", "developer", "tester"]);
export type WorkerRole = z.infer<typeof workerRoleSchema>;

export const agentRoleSchema = z.enum(["analyst", "developer", "tester", "coordinator"]);
export type AgentRole = z.infer<typeof agentRoleSchema>;

export const pipelineStageSchema = z.enum(["initial", "exchange", "final"]);
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const pipelineStatusSchema = z.enum(["started", "completed"]);
export type PipelineStatus = z.infer<typeof pipelineStatusSchema>;

export const executionStateSchema = z.enum(["initial", "exchange", "final", "completed"]);
export type ExecutionState = z.infer<typeof executionStateSchema>;

export const pipelineInputSchema = z.object({
  task: z.string().trim().min(1),
  context: z.record(z.string(), z.string()).default({}),
});
export type MultiAgentPipelineInput = z.infer<typeof pipelineInputSchema>;

export const agentMessageSchema = z.object({
  role: workerRoleSchema,
  content: z.string().trim().min(1),
});
export type AgentMessage = z.infer<typeof agentMessageSchema>;

export const feedbackMessageSchema = z.object({
  from: workerRoleSchema,
  to: workerRoleSchema,
  content: z.string().trim().min(1),
});
export type FeedbackMessage = z.infer<typeof feedbackMessageSchema>;

export const pipelineLogEntrySchema = z.object({
  index: z.number().int().nonnegative(),
  timestamp: z.string().datetime(),
  stage: pipelineStageSchema,
  status: pipelineStatusSchema,
  from: agentRoleSchema,
  to: agentRoleSchema.optional(),
  message: z.string().trim().min(1),
});
export type PipelineLogEntry = z.infer<typeof pipelineLogEntrySchema>;

export type MemoryRecordType = "input" | "output" | "feedback" | "summary";

export type MemoryRecord = {
  key: string;
  type: MemoryRecordType;
  content: string;
  createdAt: string;
};

export interface MemoryStore {
  append(record: MemoryRecord): void;
  getAll(): MemoryRecord[];
  compact(): void;
}

export interface ToolGateway {
  execute<T>(operation: () => Promise<T>, options?: { retries?: number; backoffMs?: number }): Promise<{ result: T; retries: number }>;
}

export interface AgentCore {
  role: WorkerRole;
  createInitialOutput(input: MultiAgentPipelineInput): Promise<AgentMessage>;
}

export interface ExecutionStateMachine {
  getState(): ExecutionState;
  transition(to: ExecutionState): void;
}

export interface TelemetrySink {
  persist(input: {
    requestId: string;
    durationMs: number;
    pipeline: MultiAgentPipelineResult;
  }): Promise<void>;
}

export const pipelineResultSchema = z.object({
  input: pipelineInputSchema,
  initialOutputs: z
    .record(z.string(), agentMessageSchema)
    .refine((value) => Object.keys(value).length > 0, {
      message: "initialOutputs must include at least one worker output",
    })
    .refine((value) => Object.keys(value).every((key) => workerRoleSchema.options.includes(key as WorkerRole)), {
      message: "initialOutputs keys must be valid worker roles",
    }),
  feedback: z.array(feedbackMessageSchema),
  coordinatorSummary: z.string().trim().min(1),
  logs: z.array(pipelineLogEntrySchema),
  metrics: z.object({
    stageDurationsMs: z.object({
      initial: z.number().nonnegative(),
      exchange: z.number().nonnegative(),
      final: z.number().nonnegative(),
    }),
    totalDurationMs: z.number().nonnegative(),
    estimatedTokens: z.number().int().nonnegative(),
    estimatedCostUsd: z.number().nonnegative(),
    logEntries: z.number().int().nonnegative(),
    feedbackCount: z.number().int().nonnegative(),
    initialRetries: z.number().int().nonnegative(),
    activeWorkers: z.array(workerRoleSchema).min(1),
    coordinationMode: z.enum(["full-mesh", "ring"]),
  }),
  budget: z.object({
    maxEstimatedTokens: z.number().int().positive(),
    withinBudget: z.boolean(),
  }),
});
export type MultiAgentPipelineResult = z.infer<typeof pipelineResultSchema>;
