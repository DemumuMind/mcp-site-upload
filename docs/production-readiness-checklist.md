# Production Readiness Checklist

## Build and Quality
- [ ] `npm run lint` passes.
- [ ] `npm run build` passes.
- [ ] `npm run smoke:check -- <target-url>` passes.
- [ ] CI workflow `ci.yml` is green on target commit.

## Security
- [ ] `security.yml` completed without unresolved high/critical findings.
- [ ] No secrets present in diff or logs.
- [ ] Required GitHub/Vercel secrets are configured.

## Deployment
- [ ] `deploy.yml` completed successfully.
- [ ] Deployment URL and release metadata captured.
- [ ] Rollback path validated in runbook.

## Observability
- [ ] Sentry DSN and environment configured.
- [ ] Uptime monitors cover `/`, `/sitemap.xml`, `/robots.txt`, `/api/health-check`.
- [ ] Alert routing and owners are defined.

## Data Safety
- [ ] Latest backup is within freshness window.
- [ ] Monthly restore drill completed within policy window.
- [ ] Backup manifest updated.

## Documentation
- [ ] `docs/runbooks/deploy.md` current.
- [ ] `docs/runbooks/incident.md` current.
- [ ] `docs/runbooks/restore.md` current.
- [ ] `docs/runbooks/security.md` current.
- [ ] `docs/session-continuation.md` updated for handoff.
