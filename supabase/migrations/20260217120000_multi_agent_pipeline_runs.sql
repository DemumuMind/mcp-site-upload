-- Multi-agent pipeline telemetry storage.

create table if not exists public.multi_agent_pipeline_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id text not null unique,
  task text not null,
  context_size integer not null check (context_size >= 0),
  active_workers text[] not null,
  coordination_mode text not null check (coordination_mode in ('full-mesh', 'ring')),
  duration_ms integer not null check (duration_ms >= 0),
  total_duration_ms integer not null check (total_duration_ms >= 0),
  initial_duration_ms integer not null check (initial_duration_ms >= 0),
  exchange_duration_ms integer not null check (exchange_duration_ms >= 0),
  final_duration_ms integer not null check (final_duration_ms >= 0),
  estimated_tokens integer not null check (estimated_tokens >= 0),
  estimated_cost_usd numeric(12, 6) not null check (estimated_cost_usd >= 0),
  log_entries integer not null check (log_entries >= 0),
  feedback_count integer not null check (feedback_count >= 0),
  initial_retries integer not null check (initial_retries >= 0),
  within_budget boolean not null,
  max_estimated_tokens integer not null check (max_estimated_tokens > 0)
);

create index if not exists multi_agent_pipeline_runs_created_at_idx
  on public.multi_agent_pipeline_runs(created_at desc);

create index if not exists multi_agent_pipeline_runs_coordination_mode_idx
  on public.multi_agent_pipeline_runs(coordination_mode, created_at desc);

alter table public.multi_agent_pipeline_runs enable row level security;

drop policy if exists "multi_agent_pipeline_runs_service_role_all" on public.multi_agent_pipeline_runs;
create policy "multi_agent_pipeline_runs_service_role_all"
on public.multi_agent_pipeline_runs
for all
to service_role
using (true)
with check (true);
