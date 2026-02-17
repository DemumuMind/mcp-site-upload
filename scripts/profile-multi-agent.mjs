const configuredBaseUrl = process.env.MULTI_AGENT_PROFILE_BASE_URL?.trim() || "";
const rounds = Math.max(1, Number(process.env.MULTI_AGENT_PROFILE_ROUNDS || 30));
const secret = process.env.MULTI_AGENT_DEMO_SECRET?.trim();
const cliBaseUrlArg = process.argv
  .slice(2)
  .find((arg) => arg.startsWith("--base-url="))
  ?.split("=")[1]
  ?.trim();

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

function avg(values) {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function stdDev(values) {
  if (values.length < 2) return 0;
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const variance =
    values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (values.length - 1);
  return Math.round(Math.sqrt(variance));
}

function buildBaseUrlCandidates() {
  const selectedInput = cliBaseUrlArg || configuredBaseUrl;
  const envList = selectedInput
    ? selectedInput
        .split(",")
        .map((value) => value.trim())
        .filter(Boolean)
    : [];
  const defaults = ["http://127.0.0.1:3101", "http://127.0.0.1:3000"];
  return [...new Set([...envList, ...defaults])];
}

async function resolveBaseUrl() {
  const candidates = buildBaseUrlCandidates();
  for (const candidate of candidates) {
    try {
      const response = await fetch(candidate, { method: "GET" });
      if (response.ok || response.status > 0) {
        return candidate;
      }
    } catch {
      // Try next candidate.
    }
  }
  throw new Error(
    `No reachable base URL found. Checked: ${candidates.join(", ")}. ` +
      "Set MULTI_AGENT_PROFILE_BASE_URL to a reachable host."
  );
}

async function runOne(baseUrl, scenario) {
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
  const baseUrl = await resolveBaseUrl();
  const all = [];
  for (let i = 0; i < rounds; i += 1) {
    const scenario = scenarios[i % scenarios.length];
    const result = await runOne(baseUrl, scenario);
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
  console.log(`avg_ms: ${avg(durations)}`);
  console.log(`stddev_ms: ${stdDev(durations)}`);
  console.log(`min_ms: ${Math.min(...durations)}`);
  console.log(`p50_ms: ${percentile(durations, 50)}`);
  console.log(`p95_ms: ${percentile(durations, 95)}`);
  console.log(`p99_ms: ${percentile(durations, 99)}`);
  console.log(`max_ms: ${Math.max(...durations)}`);
  console.log(`modes: ${JSON.stringify(byMode)}`);
}

await main();
