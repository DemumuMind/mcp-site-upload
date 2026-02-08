# 10 - Observability and Alerting

## Goal

Detect and triage auth/admin/health incidents quickly.

## Tasks

- [ ] Integrate Sentry for server actions, auth callback, and admin flows.
- [ ] Add alert rules for health-check failures and auth error spikes.
- [ ] Define severity mapping and on-call routing.
- [ ] Publish runbook links for common incidents.

## Done When

- [ ] Critical paths emit structured errors with context.
- [ ] Alerting is verified in staging with synthetic failure.
- [ ] Team has a documented response path for top incident classes.

## Verification

- Synthetic failure test for `/api/health-check`
- Synthetic auth callback error scenario
- Alert receipt and acknowledgement test

## Dependencies

- `09-playwright-ci-hardening.md`

