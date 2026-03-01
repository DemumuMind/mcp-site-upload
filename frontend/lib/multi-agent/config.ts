import { agentConfigSchema, type AgentConfig } from "./types";

export const DEFAULT_AGENT_CONFIG: AgentConfig = agentConfigSchema.parse({
  maxParallel: 3,
  retryPolicy: {
    maxAttempts: 3,
    backoffMs: 40,
  },
  timeoutMs: 5000,
  featureFlags: {},
});

export function getAgentConfig(overrides?: Partial<AgentConfig>): AgentConfig {
  if (!overrides) {
    return DEFAULT_AGENT_CONFIG;
  }

  return agentConfigSchema.parse({
    ...DEFAULT_AGENT_CONFIG,
    ...overrides,
    retryPolicy: {
      ...DEFAULT_AGENT_CONFIG.retryPolicy,
      ...(overrides.retryPolicy ?? {}),
    },
    featureFlags: {
      ...DEFAULT_AGENT_CONFIG.featureFlags,
      ...(overrides.featureFlags ?? {}),
    },
  });
}
