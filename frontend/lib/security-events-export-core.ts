import { csvEscape } from "./api/auth-helpers";
import { maskEmail, maskIpAddress } from "./security/data-protection";

export type SecurityExportRow = {
  created_at: string | null;
  event_type: string | null;
  email: string | null;
  user_id: string | null;
  ip_address: string | null;
};

type ExportQueryInput = {
  eventType: string;
  emailQuery: string;
  fromDate: string | null;
  toDate: string | null;
  fromTs: string;
  toTs: string;
  includeRawRequested: string;
  allowRawExport: boolean;
};

export type SecurityEventsExportQuery =
  | {
      ok: true;
      filters: {
        eventType: string;
        emailQuery: string;
        fromIso: string | null;
        toIso: string | null;
        includeRaw: boolean;
      };
    }
  | {
      ok: false;
      status: 400;
      error: string;
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

export function parseSecurityEventsExportQuery(input: ExportQueryInput): SecurityEventsExportQuery {
  const parsedFromTs = input.fromTs ? parseIsoTimestamp(input.fromTs) : null;
  const parsedToTs = input.toTs ? parseIsoTimestamp(input.toTs) : null;

  if (input.fromTs && !parsedFromTs) {
    return { ok: false, status: 400, error: "Invalid fromTs timestamp." };
  }
  if (input.toTs && !parsedToTs) {
    return { ok: false, status: 400, error: "Invalid toTs timestamp." };
  }

  const includeRawRequested = input.includeRawRequested.trim().toLowerCase();
  return {
    ok: true,
    filters: {
      eventType: input.eventType || "all",
      emailQuery: input.emailQuery.trim(),
      fromIso: parsedFromTs || toStartOfDayIso(input.fromDate),
      toIso: parsedToTs || toEndOfDayIso(input.toDate),
      includeRaw:
        input.allowRawExport && (includeRawRequested === "1" || includeRawRequested === "true"),
    },
  };
}

export function buildSecurityEventsCsv(rows: SecurityExportRow[], includeRaw: boolean): string {
  const header = "created_at,event_type,email,user_id,ip_address";
  const lines = rows.map((row) =>
    [
      row.created_at ?? "",
      row.event_type ?? "",
      includeRaw ? row.email ?? "" : maskEmail(row.email),
      row.user_id ?? "",
      includeRaw ? row.ip_address ?? "" : maskIpAddress(row.ip_address),
    ]
      .map((value) => csvEscape(value))
      .join(","),
  );

  return [header, ...lines].join("\n");
}
