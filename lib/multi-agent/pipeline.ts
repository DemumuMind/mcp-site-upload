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
const MAX_INITIAL_RETRIES = 2;
const RETRY_BACKOFF_MS = 40;

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

const selectActiveWorkers = (input: MultiAgentPipelineInput): WorkerRole[] => {
  const base = [...WORKER_ROLES];
  const contextSize = Object.keys(input.context).length;
  if (contextSize <= 1 && input.task.length < 120) {
    return base.filter((role) => role !== "tester");
  }
  return base;
};

const estimatePipelineTokens = (input: MultiAgentPipelineInput, workers: WorkerRole[], exchangeMode: "full-mesh" | "ring"): number => {
  const exchangeMultiplier = exchangeMode === "full-mesh" ? workers.length * Math.max(0, workers.length - 1) : workers.length;
  const raw = [
    input.task,
    ...Object.entries(input.context).flatMap(([key, value]) => [key, value]),
    workers.join(" "),
    `exchange:${exchangeMultiplier}`,
  ].join(" ");
  return estimateTokensFromText(raw) * 4;
};

const wait = (ms: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const createInitialOutputWithRetry = async (
  role: WorkerRole,
  input: MultiAgentPipelineInput,
): Promise<{ output: InitialOutputMap[WorkerRole]; retries: number }> => {
  let attempt = 0;
  while (true) {
    try {
      const output = await createInitialOutput(role, input);
      return { output, retries: attempt };
    } catch (error) {
      if (attempt >= MAX_INITIAL_RETRIES) {
        throw error;
      }
      attempt += 1;
      await wait(RETRY_BACKOFF_MS * attempt);
    }
  }
};

export const runMultiAgentPipeline = async (rawInput: MultiAgentPipelineInput): Promise<MultiAgentPipelineResult> => {
  const pipelineStartedAt = Date.now();
  const input = pipelineInputSchema.parse(rawInput);
  const activeWorkers = selectActiveWorkers(input);
  const plannedFullMeshTokens = estimatePipelineTokens(input, activeWorkers, "full-mesh");
  const coordinationMode: "full-mesh" | "ring" =
    plannedFullMeshTokens <= MAX_ESTIMATED_TOKENS_BUDGET ? "full-mesh" : "ring";
  const logs: PipelineLogEntry[] = [];
  const indexRef = { value: 0 };
  const stageDurationsMs = {
    initial: 0,
    exchange: 0,
    final: 0,
  };
  let initialRetries = 0;

  const initialStartedAt = Date.now();
  addLog(logs, indexRef, {
    stage: "initial",
    status: "started",
    from: "coordinator",
    message: `Pipeline started for task: ${input.task} (workers=${activeWorkers.join(", ")}, mode=${coordinationMode})`,
  });

  const initialEntries = await Promise.all(
    activeWorkers.map(async (role) => {
      const { output, retries } = await createInitialOutputWithRetry(role, input);
      initialRetries += retries;
      return [role, output] as const;
    }),
  );
  const initialOutputs = Object.fromEntries(initialEntries) as InitialOutputMap;

  for (const role of activeWorkers) {
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
    message: `Cross-agent feedback exchange started (${coordinationMode}).`,
  });

  const feedback =
    coordinationMode === "full-mesh"
      ? activeWorkers.flatMap((from) =>
          activeWorkers
            .filter((to) => to !== from)
            .map((to) =>
              feedbackMessageSchema.parse({
                from,
                to,
                content: createFeedback(from, to, initialOutputs),
              }),
            ),
        )
      : activeWorkers.map((from, index) => {
          const to = activeWorkers[(index + 1) % activeWorkers.length];
          return feedbackMessageSchema.parse({
            from,
            to,
            content: createFeedback(from, to, initialOutputs),
          });
        });

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
  const coordinatorSummary = `Coordinator summary: ${activeWorkers.join(", ")} completed initial + exchange phases for "${input.task}" using ${coordinationMode}.`;

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
      initialRetries,
      activeWorkers,
      coordinationMode,
    },
    budget: {
      maxEstimatedTokens: MAX_ESTIMATED_TOKENS_BUDGET,
      withinBudget: estimatedTokens <= MAX_ESTIMATED_TOKENS_BUDGET,
    },
  });
};
