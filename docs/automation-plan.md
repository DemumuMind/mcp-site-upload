# mcp-site Automation Implementation Plan

## Summary
This plan upgrades `mcp-site` from a working product to a production-ready automated delivery and operations setup while preserving current runtime behavior, especially the existing Vercel cron path `/api/health-check`.

## Decisions
- Monitoring stack: `Sentry + Uptime Kuma`.
- Merge gate: `lint + build + optional smoke on PR`, deeper checks scheduled nightly.
- Backup policy: `daily pg_dump` with `monthly restore drill`.

## Delivery Phases
1. Baseline and guardrails:
   - inventory workflows/scripts/docs
   - preserve existing cron and manual smoke workflow
2. CI gate:
   - add `.github/workflows/ci.yml`
   - run `npm ci`, `npm run lint`, `npm run build`
   - run smoke when `SMOKE_BASE_URL` or manual input exists
3. Security automation:
   - add `.github/workflows/security.yml`
   - dependency review on PR
   - npm audit for production dependencies
   - secret scanning with gitleaks
4. Deployment orchestration:
   - add `.github/workflows/deploy.yml`
   - deploy to Vercel from `main` or manual dispatch
   - post-deploy smoke check
   - documented rollback path
5. Reliability operations:
   - add health and backup verification scripts
   - add nightly smoke workflow
6. Runbooks and readiness:
   - create deployment/incident/restore/security runbooks
   - create production readiness checklist
   - keep session handoff file updated

## Non-Goals
- no breaking auth refactor
- no DB schema rewrite
- no hosting migration

## Success Criteria
- CI checks block broken changes.
- Deployment executes with post-deploy smoke validation.
- Security checks run on PR and schedule.
- Backup/restore process is measurable and documented.
- On-call instructions exist for common incidents and rollback.
