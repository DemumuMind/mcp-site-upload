# Incident Runbook

## Severity Levels
- `P1`: full outage, broken deploy path, or data integrity risk.
- `P2`: major feature degradation with active user impact.
- `P3`: minor degradation, no critical user journey blocked.

## First 15 Minutes
1. Acknowledge alert and create incident channel/thread.
2. Confirm blast radius:
   - homepage availability
   - auth routes
   - `/api/health-check`
3. Assign roles:
   - incident lead
   - comms owner
   - resolver
4. Decide:
   - immediate rollback (preferred when recent deploy is suspect)
   - hotfix forward

## Diagnostics
- GitHub Actions:
  - `ci.yml`
  - `deploy.yml`
  - `security.yml`
  - `nightly-smoke.yml`
- Runtime checks:
  - `npm run smoke:check -- <target-url>`
  - `node scripts/ops-health-report.mjs --base-url <target-url> --json`
- Observability:
  - Sentry issue stream and release tags
  - Uptime Kuma monitor status/history

## Communication
- Initial message: impact, affected routes, mitigation ETA.
- Update every 15 minutes for `P1`, every 30 minutes for `P2`.
- Close with root cause, remediation, and follow-up owner.

## Exit Criteria
- Smoke checks green.
- Error rate and uptime recovered to baseline.
- Follow-up tasks added to backlog with owners and due dates.
