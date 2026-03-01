import {
  agentMessageSchema,
  feedbackMessageSchema,
  pipelineInputSchema,
  pipelineLogEntrySchema,
  pipelineResultSchema,
  type AgentCore,
  type ExecutionState,
  type ExecutionStateMachine,
  type MemoryStore,
  type MultiAgentPipelineInput,
  type MultiAgentPipelineResult,
  type PipelineLogEntry,
  type ToolGateway,
  type WorkerRole,
} from "./types";
import { InMemoryMemoryStore } from "./memory";
import { RetryingToolGateway } from "./tool-gateway";

const WORKER_ROLES: readonly WorkerRole[] = ["analyst", "developer", "tester"];
const ESTIMATED_COST_PER_1K_TOKENS_USD = 0.0025;
const MAX_ESTIMATED_TOKENS_BUDGET = 4000;
const MAX_INITIAL_RETRIES = 2;
const RETRY_BACKOFF_MS = 40;
const ADAPTIVE_ORCHESTRATION_ENABLED = process.env.MULTI_AGENT_ADAPTIVE_ENABLED !== "0";

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

class WorkerAgentCore implements AgentCore {
  constructor(public readonly role: WorkerRole) {}

  async createInitialOutput(input: MultiAgentPipelineInput): Promise<InitialOutputMap[WorkerRole]> {
    const contextSize = Object.keys(input.context).length;
    const content = `${this.role} analysis for "${input.task}" with ${contextSize} context item(s).`;
    return agentMessageSchema.parse({ role: this.role, content });
  }
}

const EXECUTION_TRANSITIONS: Record<ExecutionState, readonly ExecutionState[]> = {
  initial: ["exchange"],
  exchange: ["final"],
  final: ["completed"],
  completed: [],
};

class PipelineExecutionStateMachine implements ExecutionStateMachine {
  private state: ExecutionState = "initial";

  getState(): ExecutionState {
    return this.state;
  }

  transition(to: ExecutionState): void {
    const allowed = EXECUTION_TRANSITIONS[this.state];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid state transition from ${this.state} to ${to}`);
    }
    this.state = to;
  }
}

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

export const runMultiAgentPipeline = async (rawInput: MultiAgentPipelineInput): Promise<MultiAgentPipelineResult> => {
  const pipelineStartedAt = Date.now();
  const input = pipelineInputSchema.parse(rawInput);
  const activeWorkers = ADAPTIVE_ORCHESTRATION_ENABLED ? selectActiveWorkers(input) : [...WORKER_ROLES];
  const plannedFullMeshTokens = estimatePipelineTokens(input, activeWorkers, "full-mesh");
  const coordinationMode: "full-mesh" | "ring" =
    !ADAPTIVE_ORCHESTRATION_ENABLED || plannedFullMeshTokens <= MAX_ESTIMATED_TOKENS_BUDGET ? "full-mesh" : "ring";
  const logs: PipelineLogEntry[] = [];
  const indexRef = { value: 0 };
  const stageDurationsMs = {
    initial: 0,
    exchange: 0,
    final: 0,
  };
  const stateMachine: ExecutionStateMachine = new PipelineExecutionStateMachine();
  const memoryStore: MemoryStore = new InMemoryMemoryStore();
  const toolGateway: ToolGateway = new RetryingToolGateway();
  const agents: Record<WorkerRole, AgentCore> = {
    analyst: new WorkerAgentCore("analyst"),
    developer: new WorkerAgentCore("developer"),
    tester: new WorkerAgentCore("tester"),
  };
  let initialRetries = 0;

  memoryStore.append({
    key: "input.task",
    type: "input",
    content: input.task,
    createdAt: new Date().toISOString(),
  });

  const initialStartedAt = Date.now();
  addLog(logs, indexRef, {
    stage: "initial",
    status: "started",
    from: "coordinator",
    message: `Pipeline started for task: ${input.task} (workers=${activeWorkers.join(", ")}, mode=${coordinationMode})`,
  });

  const initialEntries = await Promise.all(
    activeWorkers.map(async (role) => {
      const { result: output, retries } = await toolGateway.execute(
        () => agents[role].createInitialOutput(input),
        { retries: MAX_INITIAL_RETRIES, backoffMs: RETRY_BACKOFF_MS },
      );
      initialRetries += retries;
      memoryStore.append({
        key: `initial.${role}`,
        type: "output",
        content: output.content,
        createdAt: new Date().toISOString(),
      });
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
  stateMachine.transition("exchange");

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
    memoryStore.append({
      key: `feedback.${item.from}.${item.to}`,
      type: "feedback",
      content: item.content,
      createdAt: new Date().toISOString(),
    });
    addLog(logs, indexRef, {
      stage: "exchange",
      status: "completed",
      from: item.from,
      to: item.to,
      message: item.content,
    });
  }
  stageDurationsMs.exchange = Date.now() - exchangeStartedAt;
  stateMachine.transition("final");

  const finalStartedAt = Date.now();
  const coordinatorSummary = `Coordinator summary: ${activeWorkers.join(", ")} completed initial + exchange phases for "${input.task}" using ${coordinationMode}.`;
  memoryStore.append({
    key: "summary.coordinator",
    type: "summary",
    content: coordinatorSummary,
    createdAt: new Date().toISOString(),
  });

  addLog(logs, indexRef, {
    stage: "final",
    status: "completed",
    from: "coordinator",
    message: coordinatorSummary,
  });
  stageDurationsMs.final = Date.now() - finalStartedAt;
  stateMachine.transition("completed");
  memoryStore.compact();

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
