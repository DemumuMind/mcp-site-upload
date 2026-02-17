const baseUrl = process.env.MULTI_AGENT_PROFILE_BASE_URL?.trim() || "http://127.0.0.1:3101";
const rounds = Math.max(1, Number(process.env.MULTI_AGENT_PROFILE_ROUNDS || 30));
const secret = process.env.MULTI_AGENT_DEMO_SECRET?.trim();

const headers = {
  "content-type": "application/json",
  ...(secret ? { authorization: `Bearer ${secret}` } : {}),
};

const scenarios = [
  {
    name: "small",
    payload: {
      task: "Summarize deployment checklist",
      context: { priority: "low" },
    },
  },
  {
    name: "medium",
    payload: {
      task: "Draft rollout plan with risks and verification commands for catalog release.",
      context: { priority: "high", surface: "catalog", env: "staging" },
    },
  },
  {
    name: "large",
    payload: {
      task: "Design an end-to-end production release plan with rollback, observability checks, incident runbook, and coordination matrix across teams.",
      context: {
        priority: "critical",
        env: "production",
        releaseWindow: "night",
        owner: "platform",
        risk: "high",
      },
    },
  },
];

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function runOne(scenario) {
  const startedAt = Date.now();
  const response = await fetch(`${baseUrl}/api/multi-agent/demo`, {
    method: "POST",
    headers,
    body: JSON.stringify(scenario.payload),
  });
  const json = await response.json();
  const durationMs = Date.now() - startedAt;
  return {
    ok: response.ok && json?.ok === true,
    durationMs,
    mode: json?.result?.metrics?.coordinationMode || "unknown",
    withinBudget: Boolean(json?.result?.budget?.withinBudget),
    retries: Number(json?.result?.metrics?.initialRetries || 0),
  };
}

async function main() {
  const all = [];
  for (let i = 0; i < rounds; i += 1) {
    const scenario = scenarios[i % scenarios.length];
    const result = await runOne(scenario);
    all.push({ scenario: scenario.name, ...result });
  }

  const durations = all.map((x) => x.durationMs);
  const failures = all.filter((x) => !x.ok).length;
  const budgetMisses = all.filter((x) => !x.withinBudget).length;
  const totalRetries = all.reduce((sum, x) => sum + x.retries, 0);
  const byMode = all.reduce((acc, row) => {
    acc[row.mode] = (acc[row.mode] || 0) + 1;
    return acc;
  }, {});

  console.log("=== Multi-agent profile summary ===");
  console.log(`baseUrl: ${baseUrl}`);
  console.log(`rounds: ${rounds}`);
  console.log(`failures: ${failures}`);
  console.log(`budget_misses: ${budgetMisses}`);
  console.log(`total_retries: ${totalRetries}`);
  console.log(`p50_ms: ${percentile(durations, 50)}`);
  console.log(`p95_ms: ${percentile(durations, 95)}`);
  console.log(`p99_ms: ${percentile(durations, 99)}`);
  console.log(`modes: ${JSON.stringify(byMode)}`);
}

await main();
