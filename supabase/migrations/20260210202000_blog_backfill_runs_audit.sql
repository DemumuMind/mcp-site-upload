-- Audit history for admin-triggered RU blog backfill runs.

create extension if not exists pgcrypto;

create table if not exists public.blog_backfill_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  status text not null check (status in ('success', 'partial', 'failed')),
  apply boolean not null default true,
  scan_limit integer not null check (scan_limit >= 1 and scan_limit <= 5000),
  table_stats jsonb not null default '{}'::jsonb,
  storage_stats jsonb not null default '{}'::jsonb,
  changed_total integer not null default 0 check (changed_total >= 0),
  applied_total integer not null default 0 check (applied_total >= 0),
  error_total integer not null default 0 check (error_total >= 0),
  error_message text
);

create index if not exists blog_backfill_runs_created_at_idx
  on public.blog_backfill_runs(created_at desc);

alter table public.blog_backfill_runs enable row level security;

drop policy if exists "blog_backfill_runs_service_role_all" on public.blog_backfill_runs;
create policy "blog_backfill_runs_service_role_all"
on public.blog_backfill_runs
for all
to service_role
using (true)
with check (true);
