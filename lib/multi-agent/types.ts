import { z } from "zod";

export const workerRoleSchema = z.enum(["analyst", "developer", "tester"]);
export type WorkerRole = z.infer<typeof workerRoleSchema>;

export const agentRoleSchema = z.enum(["analyst", "developer", "tester", "coordinator"]);
export type AgentRole = z.infer<typeof agentRoleSchema>;

export const pipelineStageSchema = z.enum(["initial", "exchange", "final"]);
export type PipelineStage = z.infer<typeof pipelineStageSchema>;

export const pipelineStatusSchema = z.enum(["started", "completed"]);
export type PipelineStatus = z.infer<typeof pipelineStatusSchema>;

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

export const pipelineResultSchema = z.object({
  input: pipelineInputSchema,
  initialOutputs: z.record(workerRoleSchema, agentMessageSchema),
  feedback: z.array(feedbackMessageSchema),
  coordinatorSummary: z.string().trim().min(1),
  logs: z.array(pipelineLogEntrySchema),
});
export type MultiAgentPipelineResult = z.infer<typeof pipelineResultSchema>;
