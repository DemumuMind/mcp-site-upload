# 12 - Funnel Analytics and Conversion Baseline

## Goal

Measure conversion funnel from landing to approved submission and use it for prioritization.

## Tasks

- [ ] Define event schema: `view_landing`, `start_auth`, `auth_success`, `start_submit`, `submit_success`, `approved`.
- [ ] Implement event emission on key transitions.
- [ ] Build dashboard with step conversion and drop-off rates.
- [ ] Establish baseline and target deltas for next iteration.

## Done When

- [ ] Events fire consistently in staging and production.
- [ ] Funnel dashboard is queryable by date range and locale.
- [ ] Baseline conversion report is documented.

## Verification

- Manual event tracing in browser/network + analytics backend
- Backfill sanity check for first production week
- Dashboard screenshot/report attached to tracking issue

## Dependencies

- `03-auth-flow-manual-matrix.md`
- `11-seo-hardening.md`

