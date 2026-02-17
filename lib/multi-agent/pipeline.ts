import {
  agentMessageSchema,
  feedbackMessageSchema,
  pipelineInputSchema,
  pipelineLogEntrySchema,
  pipelineResultSchema,
  type MultiAgentPipelineInput,
  type MultiAgentPipelineResult,
  type PipelineLogEntry,
  type WorkerRole,
} from "./types";

const WORKER_ROLES: readonly WorkerRole[] = ["analyst", "developer", "tester"];
const ESTIMATED_COST_PER_1K_TOKENS_USD = 0.0025;
const MAX_ESTIMATED_TOKENS_BUDGET = 4000;

type InitialOutputMap = Record<WorkerRole, { role: WorkerRole; content: string }>;

const addLog = (
  logs: PipelineLogEntry[],
  indexRef: { value: number },
  entry: Omit<PipelineLogEntry, "index" | "timestamp">,
): void => {
  logs.push(
    pipelineLogEntrySchema.parse({
      ...entry,
      index: indexRef.value++,
      timestamp: new Date().toISOString(),
    }),
  );
};

const createInitialOutput = async (role: WorkerRole, input: MultiAgentPipelineInput): Promise<InitialOutputMap[WorkerRole]> => {
  const contextSize = Object.keys(input.context).length;
  const content = `${role} analysis for "${input.task}" with ${contextSize} context item(s).`;
  return agentMessageSchema.parse({ role, content });
};

const createFeedback = (from: WorkerRole, to: WorkerRole, outputs: InitialOutputMap): string => {
  const target = outputs[to].content;
  return `${from} feedback to ${to}: refine based on "${target}".`;
};

const estimateTokensFromText = (text: string): number => {
  const normalizedLength = text.trim().length;
  return Math.max(1, Math.ceil(normalizedLength / 4));
};

export const runMultiAgentPipeline = async (rawInput: MultiAgentPipelineInput): Promise<MultiAgentPipelineResult> => {
  const pipelineStartedAt = Date.now();
  const input = pipelineInputSchema.parse(rawInput);
  const logs: PipelineLogEntry[] = [];
  const indexRef = { value: 0 };
  const stageDurationsMs = {
    initial: 0,
    exchange: 0,
    final: 0,
  };

  const initialStartedAt = Date.now();
  addLog(logs, indexRef, {
    stage: "initial",
    status: "started",
    from: "coordinator",
    message: `Pipeline started for task: ${input.task}`,
  });

  const initialEntries = await Promise.all(WORKER_ROLES.map(async (role) => [role, await createInitialOutput(role, input)] as const));
  const initialOutputs = Object.fromEntries(initialEntries) as InitialOutputMap;

  for (const role of WORKER_ROLES) {
    addLog(logs, indexRef, {
      stage: "initial",
      status: "completed",
      from: role,
      to: "coordinator",
      message: initialOutputs[role].content,
    });
  }
  stageDurationsMs.initial = Date.now() - initialStartedAt;

  const exchangeStartedAt = Date.now();
  addLog(logs, indexRef, {
    stage: "exchange",
    status: "started",
    from: "coordinator",
    message: "Cross-agent feedback exchange started.",
  });

  const feedback = WORKER_ROLES.flatMap((from) =>
    WORKER_ROLES.filter((to) => to !== from).map((to) =>
      feedbackMessageSchema.parse({
        from,
        to,
        content: createFeedback(from, to, initialOutputs),
      }),
    ),
  );

  for (const item of feedback) {
    addLog(logs, indexRef, {
      stage: "exchange",
      status: "completed",
      from: item.from,
      to: item.to,
      message: item.content,
    });
  }
  stageDurationsMs.exchange = Date.now() - exchangeStartedAt;

  const finalStartedAt = Date.now();
  const coordinatorSummary = `Coordinator summary: ${WORKER_ROLES.join(", ")} completed initial + exchange phases for "${input.task}".`;

  addLog(logs, indexRef, {
    stage: "final",
    status: "completed",
    from: "coordinator",
    message: coordinatorSummary,
  });
  stageDurationsMs.final = Date.now() - finalStartedAt;

  const tokenSource = [
    input.task,
    ...Object.entries(input.context).flatMap(([key, value]) => [key, value]),
    ...Object.values(initialOutputs).map((item) => item.content),
    ...feedback.map((item) => item.content),
    coordinatorSummary,
  ].join(" ");
  const estimatedTokens = estimateTokensFromText(tokenSource);
  const estimatedCostUsd = Number(
    ((estimatedTokens / 1000) * ESTIMATED_COST_PER_1K_TOKENS_USD).toFixed(6),
  );
  const totalDurationMs = Date.now() - pipelineStartedAt;

  return pipelineResultSchema.parse({
    input,
    initialOutputs,
    feedback,
    coordinatorSummary,
    logs,
    metrics: {
      stageDurationsMs,
      totalDurationMs,
      estimatedTokens,
      estimatedCostUsd,
      logEntries: logs.length,
      feedbackCount: feedback.length,
    },
    budget: {
      maxEstimatedTokens: MAX_ESTIMATED_TOKENS_BUDGET,
      withinBudget: estimatedTokens <= MAX_ESTIMATED_TOKENS_BUDGET,
    },
  });
};
