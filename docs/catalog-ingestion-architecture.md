# Catalog Ingestion Architecture

## Runtime Source Of Truth

- Runtime and public catalog reads continue to come only from `public.servers`.
- The search API, catalog pages, server pages, sitemap, and homepage never fan out to GitHub, Smithery, npm, PyPI, or OCI registries at request time.
- New ingestion tables exist only to support fetch state, traceability, verification, and publish decisions.

## Production Flow

- `/api/catalog/sync-all`
  - production orchestrator
  - runs the staged provider pipeline
  - selected providers: `github`, `smithery`, `npm`, `pypi`, `oci`, `registry`
  - runs catalog health checks after publish-stage mutations
- `/api/catalog/auto-sync`
  - GitHub-only operational path
  - intended for manual/debug/recovery use
  - does not fan out to Smithery, npm, PyPI, or OCI
- `/api/catalog/github-webhook`
  - validates GitHub webhook signatures
  - stores replay-safe queued deliveries
  - does not run full sync inline

## Providers

- `github`
  - primary discovery provider
  - feeds stale cleanup in batch 1
- `smithery`
  - corroboration and metadata enrichment
- `npm`
  - package identity for JS/TS ecosystem
- `pypi`
  - enrichment-first Python package metadata
  - seeded from known package names and repo hints
- `oci`
  - explicit-ref container metadata
  - GHCR first, Docker Hub only for explicit refs
- `registry`
  - corroboration-only source
  - seeded against the official MCP Registry
  - never used as runtime truth

## Pipeline Stages

1. `fetch`
   - load provider state from `source_fetch_state`
   - apply conditional headers where supported
   - record attempt/success/failure timestamps and backoff hints
2. `snapshot`
   - persist raw payloads and normalized summaries to `source_candidates_raw`
3. `normalize`
   - map each provider payload into a shared `NormalizedCandidate`
4. `dedupe`
   - match candidates against existing catalog state by:
     - manual override
     - canonical name
     - normalized repo URL
     - package identity
     - homepage URL
     - server URL
5. `verify`
   - compute trust score and publish decision
   - write structured outcomes to `verification_runs`
6. `publish`
   - write only approved rows into `public.servers`
   - weak candidates stay raw-only
7. `stale`
   - GitHub full-sweep only in batch 1
   - preserves two-step stale lifecycle
8. `invalidate`
   - shared catalog cache invalidation after publish/stale mutations only

## Persistence Model

- `catalog_sync_runs`
  - orchestration audit log
  - now stores `published`, `quarantined`, `stage_metrics`, `alerting_summary`
- `catalog_sync_failures`
  - bounded per-run failure rows
- `catalog_sync_locks`
  - distributed lock rows
- `source_fetch_state`
  - per-provider state (`etag`, `last_modified`, `cursor`, `failure_count`, `next_allowed_at`)
- `source_candidates_raw`
  - raw candidate snapshots and normalized summaries
- `server_sources`
  - durable mapping from provider identity to published server row when one exists
- `catalog_github_webhook_deliveries`
  - replay-safe GitHub delivery queue
- `verification_runs`
  - trust and publish-gate decisions

## Manual Row Protection

- Manual rows are still protected.
- Published automation-managed rows continue to carry `registry-auto`.
- If a candidate matches a protected manual row:
  - it is recorded in `server_sources`
  - it gets a verification run
  - it is quarantined instead of overwriting the manual row

## Stale Cleanup

- GitHub remains the only discovery source participating in stale cleanup in this batch.
- Missing rows from a healthy full sweep are handled in two phases:
  - first miss: add stale-candidate marker
  - second miss: reject the row
- Partial failures and incomplete sweeps do not trigger stale mutation.

## Health Checks

- Catalog health checks now reuse the stronger SSRF-safe probe core from `frontend/lib/api/health-check-core.ts`.
- Protections include:
  - localhost/private range blocking
  - DNS validation
  - redirect revalidation
  - bounded timeout/retries

## Operational Debugging

Start here when a sync behaves unexpectedly:

1. inspect the latest `catalog_sync_runs` row
2. inspect related `catalog_sync_failures`
3. inspect `source_fetch_state` for stuck failure counts or backoff state
4. inspect `source_candidates_raw` for upstream payloads
5. inspect `server_sources` for match reason and publish state
6. inspect `verification_runs` for trust score and rejection/quarantine reasons

## Rollback

- Disable the cron route calling `/api/catalog/sync-all` if automation needs to pause.
- `public.servers` remains the runtime read model, so rollback can be limited to:
  - reverting application code
  - disabling cron
  - optionally repairing `server_sources` / `verification_runs` / `source_candidates_raw`
- No runtime path depends on live external registry availability.

## Follow-up Work

- Queue draining now runs through the standalone external worker and workflow.
- Official MCP Registry corroboration is implemented as a supporting source and remains explicitly excluded from runtime truth.
