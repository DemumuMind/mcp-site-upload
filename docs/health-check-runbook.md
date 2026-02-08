# Health Check Runbook

## Purpose
Run daily availability checks for active MCP servers via `/api/health-check` and persist status in `servers`.

## Scheduler
- Production scheduler is configured in `vercel.json`.
- Current cadence: daily at `03:00` UTC.

## Required Environment Variables
- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- One of:
  - `HEALTH_CHECK_CRON_SECRET`
  - `CRON_SECRET` (Vercel convention)

The route accepts `Authorization: Bearer <secret>`.

## Manual Verification
1. Start app locally:
   - `npm run dev`
2. Trigger endpoint:
   - `curl -X POST http://localhost:3000/api/health-check -H "Authorization: Bearer <your-secret>"`
3. Expected result:
   - HTTP `200` with JSON summary (`total`, `summary`, `updateErrors`).

## Failure Modes
- `401 Unauthorized`: missing/invalid bearer token.
- `500 Missing cron secret`: neither `HEALTH_CHECK_CRON_SECRET` nor `CRON_SECRET` is set.
- `500 Supabase admin credentials are not configured`: missing service role envs.
