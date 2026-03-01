# Data Protection Policy

## Owner, Start, Deadline
- Owner: Sec Lead
- Start: 2026-03-09
- Deadline: 2026-03-27
- Status: Implemented baseline controls (2026-03-01)

## PII Inventory
Primary security dataset: `auth_security_events`.

| Field | Sensitivity | Retention | Purpose |
| --- | --- | --- | --- |
| `event_type` | internal | 365 days | Security analytics and abuse detection |
| `email` | restricted | 90 days | Targeted incident follow-up |
| `email_hash` | confidential | 365 days | Pseudonymous correlation |
| `user_id` | confidential | 365 days | Account-level correlation |
| `ip_address` | restricted | 30 days | Abuse controls and anomaly detection |

Code source of truth: `lib/security/data-protection.ts`.

## Retention / TTL Rules
- File-based auth security logs: `AUTH_SECURITY_LOG_RETENTION_DAYS` (default `14`).
- Exported security events are generated on-demand with `Cache-Control: no-store`.
- Raw PII export is disabled by default and must be explicitly enabled via `ADMIN_SECURITY_EXPORT_ALLOW_RAW=1`.

## Redaction and Masking
- Admin CSV export now masks:
  - Email: `ab***@domain.tld`
  - IP (IPv4): `x.x.*.*`
  - IP (IPv6): partial prefix with hidden segments
- File auth logs store only masked email/IP values.

## Access Controls
- Security event export endpoint: admin token required (`withAdminAuth`).
- Raw PII export requires both:
  - admin auth
  - `ADMIN_SECURITY_EXPORT_ALLOW_RAW=1` plus `includeRaw=true|1` query flag

## Operational Notes
- If legal retention requirements change, update:
  1. `lib/security/data-protection.ts`
  2. this policy document
  3. environment defaults for retention windows
