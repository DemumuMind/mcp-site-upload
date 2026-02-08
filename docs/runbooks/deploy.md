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

## Automated Path
1. Merge to `main` or run `.github/workflows/deploy.yml` manually.
2. Workflow runs:
   - `npm ci`
   - `npm run lint`
   - `npm run build`
   - Vercel deploy
   - post-deploy `npm run smoke:check -- <target-url>`
3. Confirm workflow summary includes:
   - environment (`preview` or `production`)
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
