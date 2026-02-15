# DemumuMind MCP

[![CI + Auth E2E](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/ci.yml?branch=main&label=CI%20%2B%20Auth%20E2E)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/ci.yml)
[![Deploy](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/deploy.yml?branch=main&label=Deploy)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/deploy.yml)
[![Security](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/security.yml?branch=main&label=Security)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/security.yml)
[![Nightly Smoke](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/nightly-smoke.yml?branch=main&label=Nightly%20Smoke)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/nightly-smoke.yml)
[![Supabase Migrations](https://img.shields.io/github/actions/workflow/status/DemumuMind/mcp-site-upload/supabase-migrations.yml?branch=main&label=Supabase%20Migrations)](https://github.com/DemumuMind/mcp-site-upload/actions/workflows/supabase-migrations.yml)

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
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | one of two required (for DB mode) | Supabase legacy anon key |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | one of two required (for DB mode) | Supabase publishable key (preferred) |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY` | optional fallback | legacy publishable-key alias supported by this app |
| `NEXT_PUBLIC_SITE_URL` | recommended | Canonical URL for metadata/sitemap |
| `SUPABASE_SERVICE_ROLE_KEY` | required for admin + health updates | server-side privileged Supabase access |
| `ADMIN_AUTH_MODE` | optional | admin auth mode: `hybrid` (default), `supabase`, or `token` |
| `ADMIN_FALLBACK_TOKEN_ENABLED` | optional | enable/disable token fallback in `hybrid` mode (default `true`) |
| `ADMIN_ACCESS_TOKEN` | required for token fallback | cookie-based admin auth token (`token` mode or hybrid fallback) |
| `ADMIN_TOKEN_ACTOR_LABEL` | optional | human-readable actor label for fallback-token audit records |
| `HEALTH_CHECK_CRON_SECRET` | one of two required | bearer token for `/api/health-check` |
| `BLOG_AUTOPUBLISH_CRON_SECRET` | recommended | bearer token for `/api/blog/auto-publish` |
| `CATALOG_AUTOSYNC_CRON_SECRET` | recommended | bearer token for `/api/catalog/auto-sync` |
| `CRON_SECRET` | one of two required | shared Vercel Cron-compatible alias for all cron endpoints |
| `EXA_API_KEY` | required for blog automation | deep research provider key for auto blog posts |
| `CATALOG_AUTOSYNC_REGISTRY_URL` | optional | MCP Registry base URL override |
| `CATALOG_AUTOSYNC_PAGE_LIMIT` | optional | page size per registry fetch (default `100`) |
| `CATALOG_AUTOSYNC_MAX_PAGES` | optional | max pages per sync run (default `120`) |
| `CATALOG_AUTOSYNC_STALE_CLEANUP_ENABLED` | optional | enable stale auto-row cleanup (default `true`) |
| `CATALOG_AUTOSYNC_QUALITY_FILTER_ENABLED` | optional | filter obvious test/staging/template entries (default `true`) |
| `CATALOG_AUTOSYNC_ALLOWLIST_PATTERNS` | optional | comma-separated wildcard/regex patterns to force-allow entries |
| `CATALOG_AUTOSYNC_DENYLIST_PATTERNS` | optional | comma-separated wildcard/regex patterns to auto-reject noisy entries |

Notes:
- If Supabase env vars are missing, app falls back to local mock data for public catalog.
- User auth callbacks use `/auth/callback`. Configure this URL in Supabase Auth provider settings for each environment.
- `/submit-server` and `/account` are protected routes and require a valid user session.
- For production cron auth, set either route-specific secrets (`HEALTH_CHECK_CRON_SECRET`, `BLOG_AUTOPUBLISH_CRON_SECRET`, `CATALOG_AUTOSYNC_CRON_SECRET`) or one shared `CRON_SECRET`.

## Database Migrations

Supabase migrations live in `supabase/migrations`.

Current key migrations:
- `20260208071000_init_mcp_catalog.sql` - base schema + RLS
- `20260208074000_server_health_checks.sql` - health status fields
- `20260208080000_seed_top_mcp_servers.sql` - cold-start seed dataset (idempotent upsert by slug)
- `20260208194500_user_owned_submissions.sql` - user-owned submissions (`owner_user_id`) + stricter auth submit/read policies
- `20260210220000_admin_dashboard_analytics.sql` - admin dashboard analytics/settings tables
- `20260212190000_admin_auth_audit_blog_runs.sql` - admin roles, audit log, blog automation run history

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

## Blog Auto-Publish

Endpoint:
- `GET/POST /api/blog/auto-publish`

Auth:
- `Authorization: Bearer <BLOG_AUTOPUBLISH_CRON_SECRET|CRON_SECRET>`

Manual trigger:

```bash
curl -X POST "http://localhost:3000/api/blog/auto-publish?count=1" \
  -H "Authorization: Bearer $BLOG_AUTOPUBLISH_CRON_SECRET"
```

Default Vercel cron schedule:
- `00:15` UTC
- `06:15` UTC
- `12:15` UTC
- `18:15` UTC

## Catalog Auto-Sync

Endpoint:
- `GET/POST /api/catalog/auto-sync`

Auth:
- `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

Manual trigger:

```bash
curl -X POST "http://localhost:3000/api/catalog/auto-sync?limit=100&pages=120&cleanupStale=true&qualityFilter=true" \
  -H "Authorization: Bearer $CATALOG_AUTOSYNC_CRON_SECRET"
```

### Registry diagnostics helper

```bash
npm run catalog:registry:stats -- --limit 100 --pages 120
```

Useful to quickly verify how many entries are currently visible in MCP Registry and whether your page window is truncating results.

Default Vercel cron schedule:
- `01:45` UTC
- `07:45` UTC
- `13:45` UTC
- `19:45` UTC

Behavior:
- pulls MCP servers from the public MCP Registry API
- creates new `active` catalog entries automatically
- applies denylist/allowlist moderation patterns (allowlist overrides denylist)
- filters obvious low-quality records (test/demo/staging/template signals)
- updates only previously auto-managed rows (`registry-auto` tag)
- marks stale auto-managed rows as `rejected` when they disappear from registry
- stale cleanup runs only after a full pagination sweep (safety guard)
- leaves manually curated rows unchanged

Moderation pattern syntax:
- wildcard patterns (e.g. `ai-smithery-*-test*`)
- regex patterns wrapped with slashes (e.g. `/^live-alpic-staging-/i`)

## Scripts

```bash
npm run dev
npm run check:utf8
npm run check:utf8:strict
npm run lint
npm run build
npm run start
npm run smoke:check -- https://your-domain
npm run ops:health-report -- --base-url https://your-domain
npm run ops:backup-verify
npm run ops:backup-verify-remote
```

Recommended pre-merge verification:

```bash
npm run check:utf8:strict
npm run lint
npm run build
```

## Catalog Data Defaults

- File: `lib/server-catalog-defaults.ts`
- Purpose:
  - normalizes `Visit` links (`repoUrl`) by MCP `slug`
  - provides expanded tool catalogs for `Tools` and detail pages
  - auto-falls back by category for entries with missing tool metadata

This means catalog cards remain usable even when upstream DB rows are incomplete.

## Deployment (Vercel)

Deployment prerequisites (GitHub + Vercel integration):
- GitHub secrets:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`
  - `SMOKE_HEALTH_TOKEN` (optional but recommended)
- Repository variables:
  - `SMOKE_BASE_URL` (recommended for CI and nightly smoke)
  - `SMOKE_ALLOW_PROTECTED=true` only for protected preview URLs that return `401` to anonymous probes
  - `VERCEL_DEPLOY_ENABLED=true` to activate deploy steps in `.github/workflows/deploy.yml`
  - `CATALOG_GUARD_ENABLED=true` to enable nightly catalog-count alerting workflow
  - `CATALOG_GUARD_MIN_TOTAL` optional minimum expected `/api/catalog/search` total (default `1000`)
  - `CATALOG_GUARD_SEARCH_PATH` optional override path (default `/api/catalog/search?page=1&pageSize=1`)
  - `CATALOG_GUARD_TIMEOUT_MS` optional request timeout in ms (default `12000`)

1. Import repository into Vercel.
2. Configure required env vars for Production:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - one of:
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `ADMIN_ACCESS_TOKEN`
   - `CRON_SECRET` (or route-specific cron secrets)
   - `NEXT_PUBLIC_SITE_URL` (your production domain)
   - `EXA_API_KEY` (for blog auto-publish)
   - optional: `CATALOG_AUTOSYNC_PAGE_LIMIT`, `CATALOG_AUTOSYNC_MAX_PAGES`, `CATALOG_AUTOSYNC_QUALITY_FILTER_ENABLED`, `CATALOG_AUTOSYNC_ALLOWLIST_PATTERNS`, `CATALOG_AUTOSYNC_DENYLIST_PATTERNS`
3. Confirm `vercel.json` cron is detected.
4. Deploy and verify:
   - home page and server detail pages
   - `/sitemap.xml`
   - `/robots.txt`
   - `/api/health-check` (authorized manual call)
   - `/api/catalog/auto-sync` (authorized manual call)

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
| `.github/workflows/supabase-migrations.yml` | Auto/manual Supabase migration push to remote DB |

Repository variables controlling execution:
- `SMOKE_ENABLED=true` enables automatic smoke checks via `SMOKE_BASE_URL`.
- `SMOKE_ALLOW_PROTECTED=true` allows smoke checks to accept `401` for protected preview URLs.
- `VERCEL_DEPLOY_ENABLED=true` enables actual deploy steps in `deploy.yml`.
- `BACKUP_REMOTE_CHECK_ENABLED=true` enables remote backup artifact validation in `ci.yml` and `nightly-smoke.yml`.
- `BACKUP_REMOTE_CHECK_URL` sets remote object URL (optional when manifest location is reachable from runner).
- `BACKUP_REMOTE_CHECK_METHOD=auto|http|aws-cli` controls validation strategy (`auto` by default).
- `BACKUP_REMOTE_S3_REGION` sets region for S3 probe fallback.
- `SUPABASE_MIGRATIONS_ENABLED=true` enables remote migration workflow (`supabase-migrations.yml`).

Optional repository secrets for remote backup checks:
- `BACKUP_REMOTE_AUTH_HEADER` (`Header-Name: value`)
- `BACKUP_REMOTE_BEARER_TOKEN`

Required repository secret for Supabase migration workflow:
- `SUPABASE_DB_URL` (remote Postgres connection string for `supabase db push --db-url ...`)

## Runbooks and Ops Docs

- Plan in one file: `docs/automation-plan.md`
- Production checklist: `docs/production-readiness-checklist.md`
- Deploy runbook: `docs/runbooks/deploy.md`
- Incident runbook: `docs/runbooks/incident.md`
- Restore runbook: `docs/runbooks/restore.md`
- Security runbook: `docs/runbooks/security.md`
- Catalog automation runbook: `docs/catalog-automation.md`
- Admin dashboard analytics rollout: `docs/runbooks/admin-dashboard-analytics-rollout.md`
- Admin role seed + rollout: `docs/runbooks/admin-role-seed-rollout.md`
- Admin role seed SQL (staging/prod): `docs/runbooks/sql/admin-role-seed-staging-prod.sql`
- Backup manifest template: `ops/backup-manifest.example.json`
- Runtime backup manifest path: `ops/backup-manifest.json` (gitignored)

## Verification Before Merge

Run before committing:

```bash
npm run lint
npm run build
```

Both must pass.
