import { NextResponse } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type MultiAgentExportRow = {
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

export async function GET() {
  const access = await resolveAdminAccess();
  if (!access.actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Supabase admin mode is not configured." }, { status: 500 });
  }

  const since7dIso = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await adminClient
    .from("multi_agent_pipeline_runs")
    .select(
      "created_at, request_id, coordination_mode, duration_ms, total_duration_ms, estimated_tokens, estimated_cost_usd, initial_retries, within_budget",
    )
    .gte("created_at", since7dIso)
    .order("created_at", { ascending: false })
    .limit(20000)
    .returns<MultiAgentExportRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header =
    "created_at,request_id,coordination_mode,duration_ms,total_duration_ms,estimated_tokens,estimated_cost_usd,initial_retries,within_budget";
  const lines = (data ?? []).map((row) =>
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
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="multi-agent-weekly-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
