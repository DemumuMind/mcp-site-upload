import { expect, test } from "@playwright/test";

test.describe("POST /api/multi-agent/demo", () => {
  test("returns multi-agent result with full log", async ({ request }) => {
    const response = await request.post("/api/multi-agent/demo", {
      data: {
        task: "Draft a deployment-ready implementation plan for a dashboard feature.",
        context: {
          product: "mcp-site",
          priority: "high",
        },
      },
    });

    expect(response.ok()).toBeTruthy();

    const body = await response.json();

    expect(body.ok).toBe(true);
    expect(body.result).toBeTruthy();
    expect(Array.isArray(body.log)).toBe(true);
    expect(body.log.length).toBeGreaterThan(0);

    const initialOutputs = body.result?.initialOutputs;
    expect(initialOutputs).toBeTruthy();

    const workerAgents = ["analyst", "developer", "tester"];
    for (const role of workerAgents) {
      expect(initialOutputs).toHaveProperty(role);
    }

    const crossAgentLogs = body.log.filter(
      (entry: { from?: string; to?: string }) =>
        typeof entry?.from === "string" &&
        typeof entry?.to === "string" &&
        entry.from !== entry.to &&
        workerAgents.includes(entry.from) &&
        workerAgents.includes(entry.to)
    );
    expect(crossAgentLogs.length).toBeGreaterThan(0);

    expect(typeof body.result?.coordinatorSummary).toBe("string");
    expect(body.result.coordinatorSummary.trim().length).toBeGreaterThan(0);
    expect(body.result?.metrics).toBeTruthy();
    expect(body.result.metrics.totalDurationMs).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.stageDurationsMs.initial).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.stageDurationsMs.exchange).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.stageDurationsMs.final).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.estimatedTokens).toBeGreaterThan(0);
    expect(body.result.metrics.estimatedCostUsd).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.initialRetries).toBeGreaterThanOrEqual(0);
    expect(body.result.metrics.logEntries).toBe(body.log.length);
    expect(Array.isArray(body.result.metrics.activeWorkers)).toBe(true);
    expect(body.result.metrics.activeWorkers.length).toBeGreaterThan(0);
    expect(["full-mesh", "ring"]).toContain(body.result.metrics.coordinationMode);
    expect(body.result?.budget).toBeTruthy();
    expect(typeof body.result.budget.withinBudget).toBe("boolean");
    expect(body.result.budget.maxEstimatedTokens).toBeGreaterThan(0);

    const coordinatorFinalLog = body.log.find(
      (entry: { from?: string; stage?: string; status?: string; message?: string }) =>
        entry?.from === "coordinator" &&
        entry?.stage === "final" &&
        entry?.status === "completed" &&
        typeof entry?.message === "string" &&
        entry.message.trim().length > 0
    );
    expect(coordinatorFinalLog).toBeTruthy();
    expect(body.result.metrics.feedbackCount).toBe(crossAgentLogs.length);
  });
});
