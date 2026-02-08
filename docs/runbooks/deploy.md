# Deploy Runbook

## Scope
Safe deployment for `mcp-site` through GitHub Actions + Vercel, with smoke validation and rollback path.

## Prerequisites
- GitHub secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `SMOKE_HEALTH_TOKEN` (optional but recommended)
- Repository variable:
  - `SMOKE_BASE_URL` (recommended for CI and nightly smoke)
  - `SMOKE_ALLOW_PROTECTED=true` only if target URL is access-protected and returns `401` for anonymous probes
  - `VERCEL_DEPLOY_ENABLED=true` to activate deploy steps in `.github/workflows/deploy.yml`
  - `VERCEL_FAIL_ON_PRECHECK=true` if you want deploy to fail hard on Vercel project access errors

## Automated Path
1. Merge to `main` or run `.github/workflows/deploy.yml` manually.
2. Workflow runs:
   - `npm ci`
   - `npm run lint`
   - `npm run build`
   - Vercel preflight (`vercel pull`)
   - if preflight passes: Vercel deploy + post-deploy `npm run smoke:check -- <target-url>`
   - if preflight fails and strict mode is off: deployment is skipped with summary note
3. Confirm workflow summary includes:
   - environment (`preview` or `production`)
   - Vercel preflight outcome
   - deployment URL
   - smoke target URL

## Manual Smoke Fallback
Use existing workflow `.github/workflows/deploy-smoke-check.yml` if post-deploy validation must be rerun independently.

## Rollback
1. Open Vercel project deployments and find last known healthy deployment.
2. Promote/redeploy that deployment as production.
3. Rerun smoke checks against production URL.
4. Open incident ticket and capture:
   - failed deployment ID
   - rollback deployment ID
   - user-visible impact window

## Verification
- `npm run smoke:check -- https://<production-domain>`
- Confirm `/api/health-check` authorized probe returns `200` with summary.
