# Release Preflight Quality Control

## Owner
- DevOps Lead

## Start / Deadline
- Start: 2026-03-02
- Deadline: 2026-03-06 (initial implementation), then ongoing

## Execution steps
1. Freeze release scope on `release/*` branch.
2. Allow only release fixes with explicit owner approval.
3. Run mandatory checks: `check:utf8`, `lint`, `build`, `test`.
4. Run manual smoke on core routes: `/`, `/catalog`, `/blog`, `/contact`.
5. Capture risk notes and sign-offs before cutover.

## RC checklist
- [ ] Scope freeze confirmed
- [ ] All required checks passed
- [ ] Critical user flows validated
- [ ] Rollback candidate identified
- [ ] Sign-off captured (QA + DevOps)
