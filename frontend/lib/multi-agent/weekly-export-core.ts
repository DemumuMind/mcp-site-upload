export type MultiAgentExportRow = {
  created_at: string | null;
  request_id: string | null;
  coordination_mode: string | null;
  duration_ms: number | null;
  total_duration_ms: number | null;
  estimated_tokens: number | null;
  estimated_cost_usd: number | null;
  initial_retries: number | null;
  within_budget: boolean | null;
};

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export function getWeeklyExportSinceIso(now = new Date()): string {
  return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
}

export function buildMultiAgentWeeklyCsv(rows: MultiAgentExportRow[]): string {
  const header =
    "created_at,request_id,coordination_mode,duration_ms,total_duration_ms,estimated_tokens,estimated_cost_usd,initial_retries,within_budget";
  const lines = rows.map((row) =>
    [
      row.created_at ?? "",
      row.request_id ?? "",
      row.coordination_mode ?? "",
      String(row.duration_ms ?? ""),
      String(row.total_duration_ms ?? ""),
      String(row.estimated_tokens ?? ""),
      String(row.estimated_cost_usd ?? ""),
      String(row.initial_retries ?? ""),
      row.within_budget === null ? "" : String(row.within_budget),
    ]
      .map((value) => csvEscape(value))
      .join(","),
  );
  return [header, ...lines].join("\n");
}
