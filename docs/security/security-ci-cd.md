# Security CI/CD Controls

## Owner, Start, Deadline
- Owner: DevOps Lead
- Start: 2026-03-09
- Deadline: 2026-03-20
- Status: Implemented baseline gates (2026-03-01)

## Always-On Security Gates
- `dependency-review-action@v4` on every PR.
- `npm audit --omit=dev --audit-level=high` on push/PR/schedule.
- `osv-scanner` lockfile scan with `HIGH,CRITICAL` threshold.
- `gitleaks` scan on full git history (`--log-opts="--all"`).

## Pinned Scanner Versions
- `ghcr.io/gitleaks/gitleaks:v8.24.2`
- `ghcr.io/google/osv-scanner:v2.2.2`
- GitHub actions pinned by major versions currently in repo policy.

## Failure Policy and Triage
- Any scanner failure blocks merge/release from protected branches.
- Triage owner: DevOps Lead.
- If false positive is confirmed, add a scoped suppression with rationale and expiry date.

## Remediation SLA
- `critical`: 24 hours
- `high`: 3 business days
- `medium`: 10 business days
