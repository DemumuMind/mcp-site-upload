import assert from "node:assert/strict";
import test from "node:test";

import * as securityEventsExportCoreModule from "../frontend/lib/security-events-export-core.ts";

const { buildSecurityEventsCsv, parseSecurityEventsExportQuery } = securityEventsExportCoreModule;

test("rejects invalid fromTs values", () => {
  const parsed = parseSecurityEventsExportQuery({
    eventType: "all",
    emailQuery: "",
    fromDate: null,
    toDate: null,
    fromTs: "not-a-date",
    toTs: "",
    includeRawRequested: "",
    allowRawExport: false,
  });

  assert.deepEqual(parsed, {
    ok: false,
    status: 400,
    error: "Invalid fromTs timestamp.",
  });
});

test("respects raw export gating and falls back to masked output", () => {
  const parsed = parseSecurityEventsExportQuery({
    eventType: "login_failure",
    emailQuery: "user@example.com",
    fromDate: null,
    toDate: null,
    fromTs: "",
    toTs: "",
    includeRawRequested: "true",
    allowRawExport: false,
  });

  assert.equal(parsed.ok, true);
  if (parsed.ok) {
    assert.equal(parsed.filters.includeRaw, false);
  }
});

test("builds masked CSV rows by default", () => {
  const csv = buildSecurityEventsCsv(
    [
      {
        created_at: "2026-03-06T12:00:00.000Z",
        event_type: "login_failure",
        email: "user@example.com",
        user_id: "user-1",
        ip_address: "203.0.113.20",
      },
    ],
    false,
  );

  assert.equal(
    csv,
    "created_at,event_type,email,user_id,ip_address\n2026-03-06T12:00:00.000Z,login_failure,us***@example.com,user-1,203.0.*.*",
  );
});
