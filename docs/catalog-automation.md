# Catalog Automation Runbook

## Goal
Keep the MCP catalog auto-filled from GitHub MCP repositories with zero local file fallback.

## Endpoint
- `GET/POST /api/catalog/auto-sync`
- Auth header: `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

## Data source
- GitHub Search API (`topic:mcp-server`)
- Source is fixed to GitHub in current architecture.

## Runtime settings
- `CATALOG_AUTOSYNC_MAX_PAGES` (default `10`, max `10`)
- `CATALOG_AUTOSYNC_CRON_SECRET` or `CRON_SECRET` (required)
- `GITHUB_TOKEN` (optional but recommended for higher GitHub API limits)

## Scheduling
`vercel.json` runs sync 4 times/day:
- `01:45` UTC
- `07:45` UTC
- `13:45` UTC
- `19:45` UTC

## Safety model
- New GitHub-derived items are inserted as `active`.
- Existing rows are updated **only** if they contain `registry-auto` tag.
- Manual rows are never overwritten by this pipeline.
- Stale cleanup changes only `registry-auto` rows and marks missing entries as `rejected`.
- Stale cleanup runs after sync completes and applies grace-mode (`registry-stale-candidate` -> `registry-stale`).

## Manual trigger
```bash
curl -X POST "https://your-domain/api/catalog/auto-sync?pages=120" \
  -H "Authorization: Bearer $CATALOG_AUTOSYNC_CRON_SECRET"
```

## CI alerting for sudden catalog drops
- Workflow: `.github/workflows/catalog-count-guard.yml`
- Recommended repository vars:
  - `CATALOG_GUARD_ENABLED=true`
  - `CATALOG_GUARD_MIN_TOTAL=1000` (tune for your expected baseline)
  - `SMOKE_BASE_URL=https://your-domain`

## Response signals
Important fields in response JSON:
- `created`, `updated`
- `staleCleanupApplied`, `staleCleanupReason`
- `staleCandidates`, `staleMarked`, `staleFailed`
- `skippedManual`, `skippedInvalid`
- `failed`, `failures[]`
- `changedSlugs[]`
- `alerting.status` (`ok` | `partial` | `error`)
- `alerting.shouldWarn`, `alerting.shouldPage`
- `alerting.signalCount`, `alerting.signals[]` with `code`, `severity`, `message`, and optional `value`/`threshold`

HTTP status:
- `200` when `alerting.status` is `ok` or `partial`
- `207` when `alerting.status` is `error`

## Monitoring and alerting
- The route now emits structured logs with `event: "catalog.auto_sync.completed"` and includes `alertStatus`, `signals`, and failure counts.
- Warning conditions (partial): stale cleanup skipped, stale cleanup capped, low coverage ratio.
- Error conditions: any sync failure (`failed > 0`) or unhandled route error.
- Recommended alert wiring:
  1. Filter logs by `event = catalog.auto_sync.completed`.
  2. Trigger warning alert when `shouldWarn=true`.
  3. Trigger paging alert when `shouldPage=true` or when response has `alerting.status=error`.
  4. Include `alerting.signals[]` and `failures[]` in incident payload.

## Rollback
1. Disable cron jobs for `/api/catalog/auto-sync` in `vercel.json`.
2. Optionally disable stale cleanup via `CATALOG_AUTOSYNC_STALE_CLEANUP_ENABLED=false`.
3. Redeploy.
4. Optional data rollback in Supabase:
   - filter rows with tag `registry-auto`
   - restore status for required rows manually.

## Quick status (checks 1/2/3)
Use:
- `GET /api/catalog/automation-status`
- Auth header: `Authorization: Bearer <CATALOG_AUTOSYNC_CRON_SECRET|CRON_SECRET>`

Response includes:
1. `checks.cronConfigured` — cron schedule exists for `/api/catalog/auto-sync`
2. `checks.secretConfigured` — `CATALOG_AUTOSYNC_CRON_SECRET` or `CRON_SECRET` is set
3. `checks.runtimeReady` — Supabase/runtime check passes

If all three are `true`, auto-fill is configured and operational.
