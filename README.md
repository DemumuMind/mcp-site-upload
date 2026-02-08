# DemumuMind MCP

Community-curated catalog of MCP (Model Context Protocol) servers with:
- searchable public catalog
- server submission + admin moderation flow
- server detail pages with SEO metadata
- scheduled health checks and status indicators

## Tech Stack
- Next.js 15 (App Router), React 19, TypeScript
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

What is checked:
- `/`
- `/sitemap.xml`
- `/robots.txt`
- first `/server/[slug]` URL found in sitemap (if present)
- `/api/health-check` unauthorized behavior (401/500) and authorized behavior (200, if token provided)

### GitHub Actions Trigger

Workflow: `.github/workflows/deploy-smoke-check.yml`

- Trigger manually via **Actions → Deploy Smoke Check → Run workflow**
- Inputs:
  - `target_url` (required)
  - `include_health_probe` (optional boolean)
- Optional repository secret:
  - `SMOKE_HEALTH_TOKEN` (required only when `include_health_probe=true`)

## Verification Before Merge

Run before committing:

```bash
npm run lint
npm run build
```

Both must pass.
