# Incident Runbook

## Owner, Start, Deadline
- Owner: DevOps Lead
- Start: 2026-03-23
- Deadline: 2026-04-03

## Severity Matrix
- `SEV-1`: full outage, broken deploy path, data integrity/security risk.
- `SEV-2`: major feature degradation with active user impact.
- `SEV-3`: minor degradation, no critical user journey blocked.
- `SEV-4`: low-impact issue with workaround.

## Alert Ownership and Escalation
- Primary on-call: DevOps Lead.
- Secondary on-call: Sec Lead.
- Data incidents: Data Lead joins within 15 minutes.
- Escalation ladder:
1. T+0 minutes: alert acknowledged by primary on-call.
2. T+10 minutes: no mitigation owner assigned -> escalate to secondary.
3. T+20 minutes: no containment for `SEV-1/SEV-2` -> escalate to engineering manager.
4. T+30 minutes: customer-visible `SEV-1` persists -> executive notification.

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
5. Set explicit next update timestamp in the incident channel.

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
- Initial message template:
  - `Status`: investigating | identified | monitoring | resolved
  - `Impact`: user-facing impact and affected routes/APIs
  - `Scope`: regions/services/tenants
  - `ETA`: next update time
- Update cadence:
  - every 15 minutes for `SEV-1`
  - every 30 minutes for `SEV-2`
  - hourly for `SEV-3/SEV-4`
- Resolution message template:
  - incident summary
  - user impact window
  - rollback/hotfix details
  - link to post-incident review

## Post-Incident Review Policy
- PIR required for all `SEV-1` and `SEV-2` incidents.
- PIR due date:
  - `SEV-1`: within 2 business days
  - `SEV-2`: within 5 business days
- PIR must include:
  - timeline (detection -> containment -> resolution)
  - root cause and contributing factors
  - what detection missed
  - prevention actions

## CAPA Tracking
- Every PIR action must have:
  - owner
  - due date
  - measurable completion criteria
- CAPA status review is part of weekly ops sync until all actions are closed.

## Exit Criteria
- Smoke checks green.
- Error rate and uptime recovered to baseline.
- Follow-up tasks added to backlog with owners and due dates.
