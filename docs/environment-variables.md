# Environment Variables Guide

## Purpose

This project uses three env files with strict roles:

- `.env.example` — template only (no real secrets).
- `.env` — shared non-secret local defaults.
- `.env.local` — machine-local secrets (never commit).

## Priority (Next.js)

When running `npm run dev`, values are resolved in this order:

1. `.env.local`
2. `.env`
3. `.env.example` (not used by runtime; reference only)

If the same key exists in multiple files, the higher-priority file wins.

## What goes where

### `.env.example`

Keep all supported keys as placeholders and comments.  
Use this file as onboarding documentation.

### `.env`

Keep only non-sensitive defaults, for example:

- feature flags (`SMOKE_ENABLED`, etc.)
- tuning/timeouts (`HEALTH_CHECK_*`, autosync limits)
- autosync safety guards (`CATALOG_AUTOSYNC_MIN_STALE_BASELINE_RATIO=0.7`, `CATALOG_AUTOSYNC_MAX_STALE_MARK_RATIO=0.15`)
- local base URL (`NEXT_PUBLIC_SITE_URL`)

### `.env.local`

Keep all sensitive values, for example:

- Supabase keys (`NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SERVICE_ROLE_KEY`)
- tokens/secrets (`*_SECRET`, `*_TOKEN`)
- third-party API keys (`EXA_API_KEY`, `SENTRY_DSN`, etc.)
- deployment credentials (`VERCEL_*`)

## Operational rules

1. Never commit `.env.local`.
2. Rotate any leaked token immediately.
3. After changing env values, restart dev server:

```bash
npm run dev
```

4. When adding a new variable:
   - add placeholder to `.env.example`;
   - put non-secret default in `.env` (if applicable);
   - put secret real value in `.env.local`.

## Quick troubleshooting

- **Auth is not configured**  
  Ensure `.env.local` contains:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`)

- **Unexpected value used**  
  Check duplicates across `.env.local` and `.env` (remember `.env.local` overrides).
