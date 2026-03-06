# Catalog Automation Architecture Plan

## Purpose
This document is the catalog automation architecture plan after the repository-wide cache refactor.

It has two jobs:
- describe the current runtime architecture as it exists today
- mark future options separately so they are not confused with shipped behavior

## Runtime Root
- Application runtime code lives under `frontend/*`.
- Route handlers live under `frontend/app/api/*`.
- Domain and cache code live under `frontend/lib/*`.
- Operational scripts live under `scripts/*`.

Any older documentation that references bare `app/*` or `lib/*` paths is stale and should be read as `frontend/app/*` and `frontend/lib/*`.

## Current As-Is Architecture

### Catalog serving path
- Active catalog data is read through `frontend/lib/servers.ts`.
- Catalog snapshot helpers live in `frontend/lib/catalog/snapshot.ts`.
- Search is served from `frontend/app/api/catalog/search/route.ts`.
- Catalog pages and route handlers run inside the `frontend/*` runtime root.

### Unified cache layer
- Source of truth: `frontend/lib/cache/repo-cache-policy.json`
- Runtime adapter: `frontend/lib/cache/policy.ts`
- Runtime invalidation helper: `frontend/lib/cache/invalidation.ts`
- Script adapter: `scripts/_shared/cache-policy.mjs`

The catalog runtime no longer owns ad-hoc cache constants in multiple files. Tags, TTLs, HTTP cache headers, browser storage keys, rate limits, and operational TTLs are defined in the shared registry and consumed through adapters.

### Current catalog cache contract
- Catalog server data policy key: `catalogActiveServers`
- Catalog cache tag: `catalog-servers`
- Catalog revalidate TTL: `300` seconds
- `invalidateCatalogCaches(...)` is the single invalidation entry point for catalog mutations

Current catalog invalidation revalidates:
- `/`
- `/catalog`
- `/categories`
- `/how-to-use`
- `/sitemap.xml`
- affected `/server/[slug]` paths
- optional `/admin` when a mutation also affects admin views

### Catalog automation endpoints
- `frontend/app/api/catalog/auto-sync/route.ts`
  - GitHub-only sync path
  - uses `CATALOG_AUTO_SYNC_LOCK_TTL_SECONDS` from the shared cache policy
  - clears catalog caches through `invalidateCatalogCaches(...)`
- `frontend/app/api/catalog/sync-all/route.ts`
  - orchestration path for GitHub, NPM, Smithery, and health checks
  - uses `CATALOG_SYNC_ALL_LOCK_TTL_SECONDS` from the shared cache policy
  - clears catalog caches through the same invalidation helper
- `frontend/app/api/catalog/automation-status/route.ts`
  - reports cron readiness, recent runs, and active locks
  - reads schedules from `vercel.json`

### Current scheduling model
Production cron scheduling is wired to `/api/catalog/sync-all` in `vercel.json`.

Current scheduled UTC runs:
- `01:45`
- `07:45`
- `13:45`
- `19:45`

`/api/catalog/auto-sync` still exists for GitHub-only execution and manual or narrow-scope operational use, but it is not the primary production orchestrator anymore.

## Current Non-Goals
- There is no shipped Redis L2 cache in the current runtime.
- There is no separate distributed catalog cache layer beyond the Next.js cache/tag model and the shared policy registry.
- There is no second cache registry for scripts or backend utilities.

If Redis, external KV, or another L2 cache is discussed elsewhere, treat it as future design only unless code in `frontend/lib/cache/*` or `scripts/_shared/cache-policy.mjs` explicitly implements it.

## Data And Control Flow
1. Cron or an authenticated manual request calls `/api/catalog/sync-all` or `/api/catalog/auto-sync`.
2. The route acquires a sync lock using TTLs from `frontend/lib/cache/repo-cache-policy.json`.
3. Source-specific sync code fetches and normalizes upstream data.
4. Catalog rows are inserted or updated in Supabase-backed storage.
5. The route records run status and failures in the sync run store.
6. The route invalidates catalog read models through `invalidateCatalogCaches(...)`.
7. Next.js cache tags and affected paths are revalidated.

## Source Roles
- GitHub remains the source behind `auto-sync`.
- `sync-all` is the current orchestration entry point for GitHub, NPM, and Smithery.
- Health checks remain part of the orchestration path, not a separate cache system.
- Optional Scrapy output is diagnostics only and not part of the runtime cache layer.

## Future Options
The items below are design targets, not current implementation:

### Optional distributed cache
- Redis or another distributed cache may be added later for cross-instance hot data.
- If added, it must remain behind the shared policy registry and not introduce parallel TTL sources.
- Mutation code must still invalidate through `frontend/lib/cache/invalidation.ts`.

### Stronger automation guarantees
- broader contract tests for automation endpoints
- more explicit failure budgets and alert thresholds
- tighter source-aware merge policies for manual vs automated fields

### Operational follow-up
- more test coverage for invalidation behavior
- clearer dashboards around recent runs and active locks
- additional documentation when new cache domains are introduced

## Migration Note
Older phrases such as:
- `app/api/catalog/*`
- `lib/catalog/*`
- `Snapshot + Redis L2`

should be interpreted as historical drift. The current runtime root is `frontend/*`, and Redis/L2 is not a shipped part of the catalog cache architecture today.
