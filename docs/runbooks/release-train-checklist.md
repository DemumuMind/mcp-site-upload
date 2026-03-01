# Release Train Checklist

Owner: DevOps Lead  
Updated: 2026-03-01

## Pre-release gates
- [ ] `npm run check:utf8`
- [ ] `npm run lint`
- [ ] `npm run build`
- [ ] `npm run test`
- [ ] Security workflow green (`.github/workflows/security.yml`)
- [ ] Smoke target selected (`smoke_base_url` or repo vars)

## Deployment readiness
- [ ] Env parity verified (local/staging/prod variable matrix)
- [ ] Rollback target identified (previous deployment id / git SHA)
- [ ] Runbooks reviewed: deploy, incident, restore, security
- [ ] Alert routing owner confirmed

## Release execution
- [ ] Deploy workflow completed successfully
- [ ] Smoke checks passed (`npm run smoke:check -- <url>`)
- [ ] Health report captured (`npm run ops:health-report -- --base-url <url>`)

## Sign-off
- [ ] Product owner
- [ ] DevOps owner
- [ ] Security owner
- [ ] Date/time and release tag recorded
