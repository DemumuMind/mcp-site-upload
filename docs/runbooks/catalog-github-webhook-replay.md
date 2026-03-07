# Catalog GitHub Webhook Replay Runbook

## Purpose

Use this runbook when GitHub webhook deliveries were queued successfully but were not processed quickly enough, or when you want to replay the queue manually without waiting for the next broader GitHub-capable sync.

## Endpoints

- Queueing endpoint:
  - `POST /api/catalog/github-webhook`

## Required Secrets

- `GITHUB_WEBHOOK_SECRET`
  - validates incoming GitHub deliveries
- `CATALOG_AUTOSYNC_CRON_SECRET` or `CRON_SECRET`
  - authorizes the cache invalidation callback used by the standalone worker

## Manual Replay

Run the standalone worker directly:

```bash
npm run catalog:webhook:worker -- --base-url https://your-domain
```

Expected outcomes:

- exit code `0`
  - queue was empty, or queue processed cleanly
- exit code `1`
  - worker encountered failures, lock contention, or callback issues

## Inspect Queue State

Recommended SQL:

```sql
select delivery_id,
       event_type,
       repo_full_name,
       repo_url_normalized,
       status,
       sync_run_id,
       created_at,
       processed_at
from public.catalog_github_webhook_deliveries
order by created_at desc
limit 50;
```

## Inspect Related Sync Runs

```sql
select id,
       trigger,
       status,
       started_at,
       finished_at,
       published,
       quarantined,
       failed,
       error_summary
from public.catalog_sync_runs
where trigger in ('catalog.github_webhook_process', 'catalog.github_webhook_external_worker')
order by started_at desc
limit 20;
```

## Replay Safety

- Deliveries are deduped by `delivery_id`.
- Re-running the worker does not duplicate queue rows.
- If a delivery is already marked `processed`, the worker only affects still-queued deliveries.

## Scheduled External Worker

- Workflow: `.github/workflows/catalog-github-webhook-worker.yml`
- Default schedule: every 5 minutes
- Manual trigger: `workflow_dispatch`

## When To Use Full Sync Instead

Prefer `/api/catalog/sync-all` when:

- many providers look stale
- you suspect queue entries were never generated
- you need full GitHub discovery and stale reconciliation, not only targeted repo updates
