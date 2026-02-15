# Catalog Automation Runbook

## Goal
Keep the MCP catalog auto-filled from the public MCP Registry with zero manual moderation for trusted auto-managed entries.

## Endpoint
- `GET/POST /api/catalog/auto-sync`
- Auth header: `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

## Data source
- Default source: `https://registry.modelcontextprotocol.io/v0.1/servers`
- Override with `CATALOG_AUTOSYNC_REGISTRY_URL`

## Runtime settings
- `CATALOG_AUTOSYNC_PAGE_LIMIT` (default `100`, max `100`)
- `CATALOG_AUTOSYNC_MAX_PAGES` (default `120`, max `200`)
- `CATALOG_AUTOSYNC_STALE_CLEANUP_ENABLED` (default `true`)
- `CATALOG_AUTOSYNC_QUALITY_FILTER_ENABLED` (default `true`)
- `CATALOG_AUTOSYNC_ALLOWLIST_PATTERNS` (default empty, allow overrides)
- `CATALOG_AUTOSYNC_DENYLIST_PATTERNS` (default empty, deny auto-filters)

## Scheduling
`vercel.json` runs sync 4 times/day:
- `01:45` UTC
- `07:45` UTC
- `13:45` UTC
- `19:45` UTC

## Safety model
- New registry items are inserted as `active`.
- Existing rows are updated **only** if they contain `registry-auto` tag.
- Denylist patterns can auto-filter noisy entries before upsert.
- Allowlist patterns override denylist and quality filtering for explicit exceptions.
- Obvious low-quality/test/staging/template entries are filtered out before upsert.
- Manual rows are never overwritten.
- Stale cleanup changes only `registry-auto` rows and marks missing entries as `rejected`.
- Stale cleanup runs only when registry pagination reaches the end (prevents false stale marking on partial fetches).

## Manual trigger
```bash
curl -X POST "https://your-domain/api/catalog/auto-sync?limit=100&pages=120&cleanupStale=true&qualityFilter=true" \
  -H "Authorization: Bearer $CATALOG_AUTOSYNC_CRON_SECRET"
```

Optional one-off tuning from query string:
- `allowlist=pattern1,pattern2`
- `denylist=pattern1,pattern2`

## Registry diagnostics (no DB writes)
```bash
npm run catalog:registry:stats -- --limit 100 --pages 120
```

This command only reads MCP Registry pages and helps confirm expected totals vs. configured pagination bounds.

## CI alerting for sudden catalog drops
- Workflow: `.github/workflows/catalog-count-guard.yml`
- Recommended repository vars:
  - `CATALOG_GUARD_ENABLED=true`
  - `CATALOG_GUARD_MIN_TOTAL=1000` (tune for your expected baseline)
  - `SMOKE_BASE_URL=https://your-domain`

## Response signals
Important fields in response JSON:
- `created`, `updated`
- `moderationRulesEnabled`, `allowlisted`
- `moderationFiltered`, `moderationFilteredSamples[]`
- `qualityFilterEnabled`, `qualityFiltered`, `qualityFilteredSamples[]`
- `staleCleanupApplied`, `staleCleanupReason`
- `staleCandidates`, `staleMarked`, `staleFailed`
- `skippedManual`, `skippedInvalid`
- `failed`, `failures[]`
- `changedSlugs[]`

Non-zero `failed` returns HTTP `207`.

## Rollback
1. Disable cron jobs for `/api/catalog/auto-sync` in `vercel.json`.
2. Optionally disable stale cleanup via `CATALOG_AUTOSYNC_STALE_CLEANUP_ENABLED=false`.
3. Redeploy.
4. Optional data rollback in Supabase:
   - filter rows with tag `registry-auto`
   - restore status for required rows manually.
