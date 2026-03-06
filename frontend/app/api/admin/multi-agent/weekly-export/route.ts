import { NextResponse } from "next/server";
import { resolveAdminApiAccess } from "@/lib/admin-access";
import { buildMultiAgentWeeklyCsv, getWeeklyExportSinceIso, type MultiAgentExportRow } from "@/lib/multi-agent/weekly-export-core";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function GET(request: Request) {
  const access = await resolveAdminApiAccess(request);
  if (!access.actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Supabase admin mode is not configured." }, { status: 500 });
  }

  const { data, error } = await adminClient
    .from("multi_agent_pipeline_runs")
    .select(
      "created_at, request_id, coordination_mode, duration_ms, total_duration_ms, estimated_tokens, estimated_cost_usd, initial_retries, within_budget",
    )
    .gte("created_at", getWeeklyExportSinceIso())
    .order("created_at", { ascending: false })
    .limit(20000)
    .returns<MultiAgentExportRow[]>();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const csv = buildMultiAgentWeeklyCsv(data ?? []);

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="multi-agent-weekly-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
