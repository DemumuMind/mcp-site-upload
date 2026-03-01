-- Agent task queue storage.

create table if not exists public.agent_tasks (
  id text primary key,
  intent text not null,
  constraints jsonb not null default '[]'::jsonb,
  context_refs jsonb not null default '[]'::jsonb,
  status text not null default 'queued' check (status in ('queued', 'running', 'done', 'failed')),
  delta_eta text,
  error_summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  started_at timestamptz,
  finished_at timestamptz
);

drop trigger if exists trg_agent_tasks_updated_at on public.agent_tasks;
create trigger trg_agent_tasks_updated_at
before update on public.agent_tasks
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists agent_tasks_status_created_at_idx
  on public.agent_tasks(status, created_at desc);

alter table public.agent_tasks enable row level security;

drop policy if exists "agent_tasks_service_role_all" on public.agent_tasks;
create policy "agent_tasks_service_role_all"
on public.agent_tasks
for all
to service_role
using (true)
with check (true);
