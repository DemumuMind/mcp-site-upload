# Data Freshness and Ingestion Reliability

Date: 2026-03-01  
Owner: Data Lead

## Governance
- Migration filenames must follow `YYYYMMDDHHMMSS_description.sql`.
- Duplicate/non-monotonic prefixes are blocked by `npm run check:migrations` in CI quality gate.

## Freshness targets
- Catalog ingestion target freshness: <= 24h.
- Critical provider refresh target: <= 6h after successful source sync.

## Reliability controls
- Retry with exponential backoff for external source calls.
- Timeouts and circuit-breaker behavior required for ingestion workers.
- Deduplication and schema validation are mandatory before writes.

## Incident triage
- Any freshness breach > 24h requires incident ticket and owner assignment.
- Repeated source instability is escalated to vendor governance review.
