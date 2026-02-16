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

## Automated Path
1. Merge to `main` or run `.github/workflows/deploy.yml` manually.
  2. Workflow runs:
   - `npm ci`
   - `npm run check:utf8:strict`
   - `npm run lint`
   - `npm run build`
     - `scripts/run-build.mjs` loads both `.env` and `.env.local` before bundling, so verify those files contain the Supabase URL, publishable key, and related secrets.
   - Vercel deploy
   - post-deploy `npm run smoke:check -- <target-url>`
3. Confirm workflow summary includes:
   - environment (`preview` or `production`)
   - deployment URL
   - smoke target URL

## Manual Smoke Fallback
Use existing workflow `.github/workflows/deploy-smoke-check.yml` if post-deploy validation must be rerun independently.

## Vercel Cron Schedule (UTC)
- `/api/health-check` -> `03:00`
- `/api/blog/auto-publish` -> `00:15`, `06:15`, `12:15`, `18:15`
- `/api/catalog/auto-sync` -> `01:45`, `07:45`, `13:45`, `19:45`

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
