-- Catalog sync run audit tables and distributed lock table.

create table if not exists public.catalog_sync_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  "trigger" text not null,
  status text not null default 'running' check (status in ('running', 'success', 'partial', 'error')),
  source_scope text[] not null default '{}'::text[],
  fetched integer not null default 0 check (fetched >= 0),
  upserted integer not null default 0 check (upserted >= 0),
  failed integer not null default 0 check (failed >= 0),
  stale_marked integer not null default 0 check (stale_marked >= 0),
  duration_ms integer check (duration_ms is null or duration_ms >= 0),
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_catalog_sync_runs_updated_at on public.catalog_sync_runs;
create trigger trg_catalog_sync_runs_updated_at
before update on public.catalog_sync_runs
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists catalog_sync_runs_started_at_idx
  on public.catalog_sync_runs(started_at desc);

create index if not exists catalog_sync_runs_status_started_at_idx
  on public.catalog_sync_runs(status, started_at desc);

alter table public.catalog_sync_runs enable row level security;

drop policy if exists "catalog_sync_runs_service_role_all" on public.catalog_sync_runs;
create policy "catalog_sync_runs_service_role_all"
on public.catalog_sync_runs
for all
to service_role
using (true)
with check (true);

create table if not exists public.catalog_sync_failures (
  id uuid primary key default gen_random_uuid(),
  run_id uuid not null references public.catalog_sync_runs(id) on delete cascade,
  source text not null,
  entity_key text not null,
  stage text not null,
  error_code text,
  error_message_sanitized text not null,
  payload_hash text,
  created_at timestamptz not null default now()
);

create index if not exists catalog_sync_failures_run_id_idx
  on public.catalog_sync_failures(run_id);

alter table public.catalog_sync_failures enable row level security;

drop policy if exists "catalog_sync_failures_service_role_all" on public.catalog_sync_failures;
create policy "catalog_sync_failures_service_role_all"
on public.catalog_sync_failures
for all
to service_role
using (true)
with check (true);

create table if not exists public.catalog_sync_locks (
  lock_key text primary key,
  locked_until timestamptz not null,
  holder_id text not null,
  updated_at timestamptz not null default now()
);

drop trigger if exists trg_catalog_sync_locks_updated_at on public.catalog_sync_locks;
create trigger trg_catalog_sync_locks_updated_at
before update on public.catalog_sync_locks
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.catalog_sync_locks enable row level security;

drop policy if exists "catalog_sync_locks_service_role_all" on public.catalog_sync_locks;
create policy "catalog_sync_locks_service_role_all"
on public.catalog_sync_locks
for all
to service_role
using (true)
with check (true);
