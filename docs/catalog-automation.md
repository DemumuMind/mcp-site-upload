# Catalog Automation Runbook

## Goal
Keep the catalog populated through the current `frontend/*` runtime without introducing a second cache policy system.

Primary architectural rule:
- `public.servers` remains the only runtime/public source of truth.
- External registries are ingestion inputs, never live runtime read dependencies.

The catalog automation stack now depends on the shared cache layer:
- `frontend/lib/cache/repo-cache-policy.json`
- `frontend/lib/cache/policy.ts`
- `frontend/lib/cache/invalidation.ts`
- `scripts/_shared/cache-policy.mjs`

## Runtime Root
- Route handlers: `frontend/app/api/catalog/*`
- Domain logic: `frontend/lib/catalog/*`
- Shared cache adapters: `frontend/lib/cache/*`
- Script and ops consumers: `scripts/*`

Any older references to bare `app/*` or `lib/*` paths are outdated.

## Active Endpoints
- `GET/POST /api/catalog/auto-sync`
  - GitHub-only sync path
  - useful for manual runs, focused debugging, or narrow operational use
- `GET/POST /api/catalog/sync-all`
  - current production orchestrator
  - runs staged ingestion for GitHub, Smithery, npm, PyPI, OCI, Registry corroboration, then health-check
- `POST /api/catalog/github-webhook`
  - validates GitHub signature
  - stores replay-safe queue entries for targeted GitHub reingest
- `GET /api/catalog/automation-status`
  - reports schedules, readiness, recent runs, and active locks

Auth header for protected endpoints:
- `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

## Data Sources
- GitHub Search API (`topic:mcp-server`)
- NPM sync
- Smithery sync
- PyPI JSON API
- OCI metadata (GHCR first, Docker Hub only for explicit refs)
- Official MCP Registry as corroboration-only source
- Optional offline Scrapy snapshot for diagnostics only

Source responsibilities:
- `auto-sync` currently runs GitHub only
- `sync-all` is the unified orchestration entry point for GitHub, NPM, Smithery, PyPI, OCI, and Registry corroboration
- queued GitHub webhook deliveries are consumed by the standalone external worker
- Scrapy output is not part of the runtime cache path and does not act as L2 cache

Detailed architecture reference:
- `docs/catalog-ingestion-architecture.md`

## Cache And Invalidation

### Source of truth
- Catalog cache policy key: `catalogActiveServers`
- Catalog tag: `catalog-servers`
- Catalog TTL: `300` seconds

These values come from `frontend/lib/cache/repo-cache-policy.json` and are consumed through `frontend/lib/cache/policy.ts`.

### Mutation flow
Catalog mutations must invalidate through `invalidateCatalogCaches(...)` in `frontend/lib/cache/invalidation.ts`.

Current catalog invalidation revalidates:
- `/`
- `/catalog`
- `/categories`
- `/how-to-use`
- `/sitemap.xml`
- changed `/server/[slug]` pages
- optional `/admin`

### Operational TTLs
- `CATALOG_AUTO_SYNC_LOCK_TTL_SECONDS = 900`
- `CATALOG_SYNC_ALL_LOCK_TTL_SECONDS = 1800`

Both values are read from the shared cache registry rather than being owned by route-local constants.

### Script-side consumers
Operational scripts that need cache headers or freshness settings must read them from `scripts/_shared/cache-policy.mjs`.

Current examples:
- `scripts/catalog-count-guard.mjs`
- `scripts/ops-health-report.mjs`
- `scripts/backup-verify.mjs`

## Scheduling
`vercel.json` currently schedules `POST /api/catalog/sync-all` four times per day:
- `01:45` UTC
- `07:45` UTC
- `13:45` UTC
- `19:45` UTC

This replaced the older documentation that described production cron against `/api/catalog/auto-sync`.

## Runtime Settings
- `CATALOG_AUTOSYNC_MAX_PAGES`
  - used by `auto-sync`
  - runtime default in the route is `120`
  - accepted max in the route is `200`
- `CATALOG_AUTOSYNC_CRON_SECRET` or `CRON_SECRET`
  - required for protected maintenance endpoints
- `GITHUB_TOKEN`
  - optional but recommended for GitHub API limits
  - also used for GHCR metadata calls when OCI refs point to `ghcr.io`

## Safety Model
- Sync routes run under authenticated cron or manual access only.
- Sync runs take a lock before execution.
- Run status and failures are recorded through the sync run store.
- Source fetch state, raw payload snapshots, source linkage, and verification runs are persisted separately from runtime rows.
- GitHub webhook deliveries are stored in a replay-safe queue before they are consumed by ingestion.
- The webhook route only queues deliveries; processing lives in the standalone worker runtime.
- Cache invalidation happens after successful mutation stages through the shared helper.
- Manual or diagnostics tooling should not introduce separate cache invalidation paths.
- Manual rows are not overwritten by automation-managed candidates.

## Manual Triggers

GitHub-only run:
```bash
curl -X POST "https://your-domain/api/catalog/auto-sync?pages=120" \
  -H "Authorization: Bearer $CATALOG_AUTOSYNC_CRON_SECRET"
```

Unified run:
```bash
curl -X POST "https://your-domain/api/catalog/sync-all" \
  -H "Authorization: Bearer $CATALOG_AUTOSYNC_CRON_SECRET"
```

External GitHub webhook worker:
```bash
npm run catalog:webhook:worker -- --base-url https://your-domain
```

## Optional Scrapy Snapshot
```bash
npm run py:scrapy:registry
```

- Output: `docs/mcp-registry-scrapy.json`
- Purpose: diagnostics and source comparison only
- Not used as runtime fallback
- Not a deployed Redis/L2 or second cache layer

## Monitoring
- Workflow: `.github/workflows/catalog-count-guard.yml`
- Health and readiness endpoint: `GET /api/catalog/automation-status`
- Route responses and logs should be treated as the source of operational truth for recent runs and failures

Recommended repository variables:
- `CATALOG_GUARD_ENABLED=true`
- `CATALOG_GUARD_MIN_TOTAL=1000`
- `SMOKE_BASE_URL=https://your-domain`

## Response Signals
Important response fields from sync routes:
- `created`, `updated`
- `published`, `quarantined`
- `staleCleanupApplied`, `staleCleanupReason`, `staleCandidates`, `staleMarked`
- `failed`, `failures[]`, `sources`
- `changedSlugs[]`
- `alerting.status` (`ok` | `partial` | `error`)
- `alerting.shouldWarn`, `alerting.shouldPage`
- `alerting.signalCount`, `alerting.signals[]`

HTTP status:
- `200` when `alerting.status` is `ok` or `partial`
- `207` when `alerting.status` is `error`

## Rollback
1. Disable the relevant cron entries in `vercel.json`.
2. Redeploy the previous application revision.
3. If needed, repair `public.servers` only; runtime does not depend on replaying external registries.
4. Use `server_sources`, `source_candidates_raw`, and `verification_runs` for debugging and replay decisions.

## Quick Status
Use:
- `GET /api/catalog/automation-status`

Auth header:
- `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

The response includes checks for:
- cron schedule presence
- secret configuration
- runtime readiness
- recent runs
- active locks

Webhook replay runbook:
- `docs/runbooks/catalog-github-webhook-replay.md`
