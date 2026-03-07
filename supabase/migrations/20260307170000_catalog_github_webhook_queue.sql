-- Durable queue for GitHub webhook deliveries used by catalog ingestion.

create table if not exists public.catalog_github_webhook_deliveries (
  id uuid primary key default gen_random_uuid(),
  delivery_id text not null unique,
  event_type text not null,
  repo_full_name text,
  repo_url text,
  repo_url_normalized text,
  payload_hash text not null,
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'processed', 'ignored')),
  sync_run_id uuid references public.catalog_sync_runs(id) on delete set null,
  processed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.catalog_github_webhook_deliveries is 'Replay-safe durable queue of GitHub webhook deliveries for targeted catalog reingest.';
comment on column public.catalog_github_webhook_deliveries.delivery_id is 'GitHub delivery identifier used for replay-safe dedupe.';
comment on column public.catalog_github_webhook_deliveries.event_type is 'GitHub event type such as push, release, or repository.';
comment on column public.catalog_github_webhook_deliveries.repo_full_name is 'Repository full name from the webhook payload when present.';
comment on column public.catalog_github_webhook_deliveries.repo_url is 'Repository HTML URL from the webhook payload.';
comment on column public.catalog_github_webhook_deliveries.repo_url_normalized is 'Normalized repository URL used for linkage and targeted reingest.';
comment on column public.catalog_github_webhook_deliveries.payload_hash is 'Stable hash of the webhook payload.';
comment on column public.catalog_github_webhook_deliveries.payload is 'Captured webhook payload.';
comment on column public.catalog_github_webhook_deliveries.status is 'Queue state for the delivery.';
comment on column public.catalog_github_webhook_deliveries.sync_run_id is 'Catalog sync run that processed the delivery, when known.';
comment on column public.catalog_github_webhook_deliveries.processed_at is 'Timestamp when the queued delivery was marked processed or ignored.';

drop trigger if exists trg_catalog_github_webhook_deliveries_updated_at on public.catalog_github_webhook_deliveries;
create trigger trg_catalog_github_webhook_deliveries_updated_at
before update on public.catalog_github_webhook_deliveries
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists catalog_github_webhook_deliveries_status_created_at_idx
  on public.catalog_github_webhook_deliveries(status, created_at asc);

create index if not exists catalog_github_webhook_deliveries_repo_url_normalized_idx
  on public.catalog_github_webhook_deliveries(repo_url_normalized);

alter table public.catalog_github_webhook_deliveries enable row level security;

drop policy if exists "catalog_github_webhook_deliveries_service_role_all" on public.catalog_github_webhook_deliveries;
create policy "catalog_github_webhook_deliveries_service_role_all"
on public.catalog_github_webhook_deliveries
for all
to service_role
using (true)
with check (true);
