-- Multi-agent task lifecycle and fallback telemetry events.

create table if not exists public.multi_agent_task_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  request_id text not null,
  event_type text not null check (event_type in ('task_received', 'task_completed', 'task_failed', 'fallback_triggered')),
  status text check (status in ('started', 'success', 'failed')),
  stage text,
  payload jsonb not null default '{}'::jsonb
);

create index if not exists multi_agent_task_events_request_created_idx
  on public.multi_agent_task_events(request_id, created_at desc);

alter table public.multi_agent_task_events enable row level security;

drop policy if exists "multi_agent_task_events_service_role_all" on public.multi_agent_task_events;
create policy "multi_agent_task_events_service_role_all"
on public.multi_agent_task_events
for all
to service_role
using (true)
with check (true);
