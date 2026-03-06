import { NextResponse } from "next/server";
import { withAdminAuth } from "@/lib/api/with-auth";
import { buildSecurityEventsCsv, parseSecurityEventsExportQuery } from "@/lib/security-events-export-core";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const GET = withAdminAuth(
  async (request) => {
    const adminClient = createSupabaseAdminClient();
    if (!adminClient) {
      return NextResponse.json({ ok: false, error: "Supabase admin mode is not configured." }, { status: 500 });
    }

    const url = new URL(request.url);
    const parsedQuery = parseSecurityEventsExportQuery({
      eventType: url.searchParams.get("eventType") ?? "all",
      emailQuery: url.searchParams.get("email") ?? "",
      fromDate: url.searchParams.get("from"),
      toDate: url.searchParams.get("to"),
      fromTs: (url.searchParams.get("fromTs") ?? "").trim(),
      toTs: (url.searchParams.get("toTs") ?? "").trim(),
      includeRawRequested: (url.searchParams.get("includeRaw") ?? "").trim(),
      allowRawExport: process.env.ADMIN_SECURITY_EXPORT_ALLOW_RAW === "1",
    });

    if (!parsedQuery.ok) {
      return NextResponse.json({ ok: false, error: parsedQuery.error }, { status: parsedQuery.status });
    }

    const { eventType, emailQuery, fromIso, toIso, includeRaw } = parsedQuery.filters;

    let query = adminClient
      .from("auth_security_events")
      .select("created_at, event_type, email, user_id, ip_address")
      .order("created_at", { ascending: false })
      .limit(5000);

    if (eventType !== "all") {
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

    const { data, error } = await query.returns<
      {
        created_at: string | null;
        event_type: string | null;
        email: string | null;
        user_id: string | null;
        ip_address: string | null;
      }[]
    >();

    if (error) {
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const csv = buildSecurityEventsCsv(data ?? [], includeRaw);

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
