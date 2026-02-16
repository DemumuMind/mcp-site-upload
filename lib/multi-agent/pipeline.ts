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

export const runMultiAgentPipeline = async (rawInput: MultiAgentPipelineInput): Promise<MultiAgentPipelineResult> => {
  const input = pipelineInputSchema.parse(rawInput);
  const logs: PipelineLogEntry[] = [];
  const indexRef = { value: 0 };

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

  const coordinatorSummary = `Coordinator summary: ${WORKER_ROLES.join(", ")} completed initial + exchange phases for "${input.task}".`;

  addLog(logs, indexRef, {
    stage: "final",
    status: "completed",
    from: "coordinator",
    message: coordinatorSummary,
  });

  return pipelineResultSchema.parse({
    input,
    initialOutputs,
    feedback,
    coordinatorSummary,
    logs,
  });
};
