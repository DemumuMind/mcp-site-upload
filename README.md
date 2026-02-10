# DemumuMind MCP

[![CI + Auth E2E](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/ci.yml?branch=main&label=CI%20%2B%20Auth%20E2E)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/deploy.yml?branch=main&label=Deploy)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/deploy.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/security.yml?branch=main&label=Security)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/security.yml)
[![Nightly Smoke](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/nightly-smoke.yml?branch=main&label=Nightly%20Smoke)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/nightly-smoke.yml)

Community-curated catalog of MCP (Model Context Protocol) servers with:
- searchable public catalog
- server submission + admin moderation flow
- server detail pages with SEO metadata
- scheduled health checks and status indicators

## Tech Stack
- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS + shadcn/ui + Lucide icons
- Supabase (PostgreSQL + RLS)
- Vercel deployment + Vercel Analytics

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local env file:

```bash
cp .env.example .env.local
```

3. Run development server:

```bash
npm run dev
```

4. Open:
- `http://localhost:3000` (catalog)
- `http://localhost:3000/auth` (user login/sign-in)
- `http://localhost:3000/account` (user account, protected)
- `http://localhost:3000/admin/login` (admin login)

## Environment Variables

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes (for DB mode) | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes (for DB mode) | Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata/sitemap |
| `SUPABASE_SERVICE_ROLE_KEY` | required for admin + health updates | server-side privileged Supabase access |
| `ADMIN_ACCESS_TOKEN` | required for `/admin` | cookie-based admin auth token |
| `HEALTH_CHECK_CRON_SECRET` | one of two required | bearer token for `/api/health-check` |
| `CRON_SECRET` | one of two required | Vercel Cron-compatible alias |

Notes:
- If Supabase env vars are missing, app falls back to local mock data for public catalog.
- User auth callbacks use `/auth/callback`. Configure this URL in Supabase Auth provider settings for each environment.
- `/submit-server` and `/account` are protected routes and require a valid user session.
- For production cron auth, set either `HEALTH_CHECK_CRON_SECRET` or `CRON_SECRET` (can be same value).

## Database Migrations

Supabase migrations live in `supabase/migrations`.

Current key migrations:
- `20260208071000_init_mcp_catalog.sql` - base schema + RLS
- `20260208074000_server_health_checks.sql` - health status fields
- `20260208080000_seed_top_mcp_servers.sql` - cold-start seed dataset (idempotent upsert by slug)
- `20260208194500_user_owned_submissions.sql` - user-owned submissions (`owner_user_id`) + stricter auth submit/read policies

Apply migrations via Supabase CLI in your environment.

## Health Checks

Endpoint:
- `GET/POST /api/health-check`

Auth:
- `Authorization: Bearer <HEALTH_CHECK_CRON_SECRET|CRON_SECRET>`

Manual trigger:

```bash
curl -X POST http://localhost:3000/api/health-check \
  -H "Authorization: Bearer $HEALTH_CHECK_CRON_SECRET"
```

Scheduler:
- `vercel.json` runs daily at `03:00` UTC.

Detailed operational notes: `docs/health-check-runbook.md`.

## Scripts

```bash
npm run dev
npm run lint
npm run build
npm run start
npm run smoke:check -- https://your-domain
npm run ops:health-report -- --base-url https://your-domain
npm run ops:backup-verify
npm run ops:backup-verify-remote
```

## Catalog Data Defaults

- File: `lib/server-catalog-defaults.ts`
- Purpose:
  - normalizes `Visit` links (`repoUrl`) by MCP `slug`
  - provides expanded tool catalogs for `Tools` and detail pages
  - auto-falls back by category for entries with missing tool metadata

This means catalog cards remain usable even when upstream DB rows are incomplete.

## Deployment (Vercel)

1. Import repository into Vercel.
2. Configure required env vars for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_ACCESS_TOKEN`
   - `CRON_SECRET` (or `HEALTH_CHECK_CRON_SECRET`)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
3. Confirm `vercel.json` cron is detected.
4. Deploy and verify:
   - home page and server detail pages
   - `/sitemap.xml`
   - `/robots.txt`
   - `/api/health-check` (authorized manual call)

## Post-Deploy Smoke Check

Run smoke checks against a deployed environment:

```bash
npm run smoke:check -- https://your-domain
```

Optional authorized health probe:

```bash
SMOKE_HEALTH_TOKEN=your-cron-secret npm run smoke:check -- https://your-domain
```

Protected preview (for 401-protected Vercel URLs):

```bash
SMOKE_ALLOW_PROTECTED=true npm run smoke:check -- https://your-protected-preview
```

What is checked:
- `/`
- `/sitemap.xml`
- `/robots.txt`
- first `/server/[slug]` URL found in sitemap (if present)
- `/api/health-check` unauthorized behavior (401/500) and authorized behavior (200, if token provided)

### GitHub Actions Trigger

Workflow: `.github/workflows/deploy-smoke-check.yml`

- Trigger manually via **Actions -> Deploy Smoke Check -> Run workflow**
- Inputs:
  - `target_url` (required)
  - `include_health_probe` (optional boolean)
- Optional repository secret:
  - `SMOKE_HEALTH_TOKEN` (required only when `include_health_probe=true`)

## Automation Workflows

| Workflow | Purpose |
|---|---|
| `.github/workflows/ci.yml` | PR/main gate: install, lint, build, optional smoke |
| `.github/workflows/security.yml` | Dependency review, npm audit, secret scan |
| `.github/workflows/deploy.yml` | Deploy orchestration to Vercel + post-deploy smoke |
| `.github/workflows/nightly-smoke.yml` | Scheduled smoke checks against configured environment |
| `.github/workflows/deploy-smoke-check.yml` | Manual smoke rerun/fallback workflow |

Repository variables controlling execution:
- `SMOKE_ENABLED=true` enables automatic smoke checks via `SMOKE_BASE_URL`.
- `SMOKE_ALLOW_PROTECTED=true` allows smoke checks to accept `401` for protected preview URLs.
- `VERCEL_DEPLOY_ENABLED=true` enables actual deploy steps in `deploy.yml`.
- `BACKUP_REMOTE_CHECK_ENABLED=true` enables remote backup artifact validation in `ci.yml` and `nightly-smoke.yml`.
- `BACKUP_REMOTE_CHECK_URL` sets remote object URL (optional when manifest location is reachable from runner).
- `BACKUP_REMOTE_CHECK_METHOD=auto|http|aws-cli` controls validation strategy (`auto` by default).
- `BACKUP_REMOTE_S3_REGION` sets region for S3 probe fallback.

Optional repository secrets for remote backup checks:
- `BACKUP_REMOTE_AUTH_HEADER` (`Header-Name: value`)
- `BACKUP_REMOTE_BEARER_TOKEN`

## Runbooks and Ops Docs

- Plan in one file: `docs/automation-plan.md`
- Production checklist: `docs/production-readiness-checklist.md`
- Deploy runbook: `docs/runbooks/deploy.md`
- Incident runbook: `docs/runbooks/incident.md`
- Restore runbook: `docs/runbooks/restore.md`
- Security runbook: `docs/runbooks/security.md`
- Backup manifest template: `ops/backup-manifest.example.json`
- Runtime backup manifest path: `ops/backup-manifest.json` (gitignored)

## Verification Before Merge

Run before committing:

```bash
npm run lint
npm run build
```

Both must pass.
