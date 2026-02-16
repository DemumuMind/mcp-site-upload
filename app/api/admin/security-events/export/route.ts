import { NextResponse, type NextRequest } from "next/server";
import { resolveAdminAccess } from "@/lib/admin-access";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

type SecurityExportRow = {
  created_at: string | null;
  event_type: string | null;
  email: string | null;
  user_id: string | null;
  ip_address: string | null;
};

function toStartOfDayIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function toEndOfDayIso(value: string | null): string | null {
  if (!value) return null;
  const parsed = new Date(`${value}T23:59:59.999Z`);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toISOString();
}

function csvEscape(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

export async function GET(request: NextRequest) {
  const access = await resolveAdminAccess();
  if (!access.actor) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminClient = createSupabaseAdminClient();
  if (!adminClient) {
    return NextResponse.json({ error: "Supabase admin mode is not configured." }, { status: 500 });
  }

  const eventType = request.nextUrl.searchParams.get("eventType") ?? "all";
  const emailQuery = (request.nextUrl.searchParams.get("email") ?? "").trim();
  const fromDate = request.nextUrl.searchParams.get("from");
  const toDate = request.nextUrl.searchParams.get("to");
  const fromTs = (request.nextUrl.searchParams.get("fromTs") ?? "").trim();
  const toTs = (request.nextUrl.searchParams.get("toTs") ?? "").trim();
  const fromIso = fromTs || toStartOfDayIso(fromDate);
  const toIso = toTs || toEndOfDayIso(toDate);

  let query = adminClient
    .from("auth_security_events")
    .select("created_at, event_type, email, user_id, ip_address")
    .order("created_at", { ascending: false })
    .limit(5000);

  if (eventType && eventType !== "all") {
    query = query.eq("event_type", eventType);
  }
  if (emailQuery) {
    query = query.ilike("email", `%${emailQuery}%`);
  }
  if (fromIso) {
    query = query.gte("created_at", fromIso);
  }
  if (toIso) {
    query = query.lte("created_at", toIso);
  }

  const { data, error } = await query.returns<SecurityExportRow[]>();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const header = "created_at,event_type,email,user_id,ip_address";
  const lines = (data ?? []).map((row) =>
    [
      row.created_at ?? "",
      row.event_type ?? "",
      row.email ?? "",
      row.user_id ?? "",
      row.ip_address ?? "",
    ]
      .map((value) => csvEscape(value))
      .join(","),
  );
  const csv = [header, ...lines].join("\n");

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="auth-security-events-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
