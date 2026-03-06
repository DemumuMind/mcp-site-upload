import assert from "node:assert/strict";
import test from "node:test";

import * as weeklyExportCoreModule from "../frontend/lib/multi-agent/weekly-export-core.ts";

const { buildMultiAgentWeeklyCsv, getWeeklyExportSinceIso } = weeklyExportCoreModule;

test("computes a seven-day window from now", () => {
  const sinceIso = getWeeklyExportSinceIso(new Date("2026-03-06T12:00:00.000Z"));
  assert.equal(sinceIso, "2026-02-27T12:00:00.000Z");
});

test("builds a stable CSV export", () => {
  const csv = buildMultiAgentWeeklyCsv([
    {
      created_at: "2026-03-06T12:00:00.000Z",
      request_id: "req-1",
      coordination_mode: "parallel",
      duration_ms: 1200,
      total_duration_ms: 1400,
      estimated_tokens: 4200,
      estimated_cost_usd: 0.12,
      initial_retries: 1,
      within_budget: true,
    },
  ]);

  assert.equal(
    csv,
    "created_at,request_id,coordination_mode,duration_ms,total_duration_ms,estimated_tokens,estimated_cost_usd,initial_retries,within_budget\n2026-03-06T12:00:00.000Z,req-1,parallel,1200,1400,4200,0.12,1,true",
  );
});
