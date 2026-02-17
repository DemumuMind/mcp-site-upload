# Branch Protection Policy (`main`)

Last updated: 2026-02-17

## Goal
Keep `main` always releasable by requiring PR review + passing CI.

## Recommended settings

### Required
- Require a pull request before merging
- Require approvals: **1**
- Dismiss stale pull request approvals when new commits are pushed
- Require status checks to pass before merging:
  - `dashboard-metrics`
  - `lint-build-smoke`
- Require branches to be up to date before merging
- Require conversation resolution before merging

### Recommended
- Require linear history (if merge commits are not part of your workflow)
- Restrict who can push to matching branches (maintainers only)

### Optional (team maturity dependent)
- Require signed commits
- Require deployment to succeed before merging

## How to configure in GitHub
1. Repository **Settings** → **Branches**
2. Create/edit protection rule for `main`
3. Enable the settings above
4. Save

## Notes
- `dashboard-metrics` verifies catalog/dashboard numbers are internally consistent.
- `lint-build-smoke` covers lint/build/e2e/smoke checks.
