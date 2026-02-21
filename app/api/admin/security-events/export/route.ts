import { NextResponse } from "next/server";
import { csvEscape } from "@/lib/api/auth-helpers";
import { withAdminAuth } from "@/lib/api/with-auth";
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

function parseIsoTimestamp(value: string): string | null {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString();
}

export const GET = withAdminAuth(
  async (request) => {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: false, error: "Supabase admin mode is not configured." }, { status: 500 });
    }

    const url = new URL(request.url);
    const eventType = url.searchParams.get("eventType") ?? "all";
    const emailQuery = (url.searchParams.get("email") ?? "").trim();
    const fromDate = url.searchParams.get("from");
    const toDate = url.searchParams.get("to");
    const fromTs = (url.searchParams.get("fromTs") ?? "").trim();
    const toTs = (url.searchParams.get("toTs") ?? "").trim();
    const parsedFromTs = fromTs ? parseIsoTimestamp(fromTs) : null;
    const parsedToTs = toTs ? parseIsoTimestamp(toTs) : null;

    if (fromTs && !parsedFromTs) {
      return NextResponse.json({ ok: false, error: "Invalid fromTs timestamp." }, { status: 400 });
    }
    if (toTs && !parsedToTs) {
      return NextResponse.json({ ok: false, error: "Invalid toTs timestamp." }, { status: 400 });
    }

    const fromIso = parsedFromTs || toStartOfDayIso(fromDate);
    const toIso = parsedToTs || toEndOfDayIso(toDate);

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
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
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
  },
  "admin.security_events.export",
);
