# 09 - Playwright CI Hardening

## Goal

Make core user/admin paths continuously verifiable in CI with low flake rate.

## Tasks

- [ ] Add CI workflow stage for Playwright core suites.
- [ ] Cover auth callback, protected routes, submit flow, admin happy path.
- [ ] Add retries and trace/video artifacts for failed runs.
- [ ] Track flaky tests and quarantine policy.

## Done When

- [ ] CI blocks merge on core E2E failures.
- [ ] Failed run artifacts are downloadable and actionable.
- [ ] Flake rate stays under defined threshold.

## Verification

- 20 consecutive CI runs with acceptable pass/flake metrics
- Review trace artifacts from intentional failure injection

## Dependencies

- `03-auth-flow-manual-matrix.md`

