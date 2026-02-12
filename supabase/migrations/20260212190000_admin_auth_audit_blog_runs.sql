-- Admin auth roles, audit trail, and blog automation run history.

create table if not exists public.admin_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'super_admin')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  created_by uuid references auth.users(id) on delete set null
);

drop trigger if exists trg_admin_roles_updated_at on public.admin_roles;
create trigger trg_admin_roles_updated_at
before update on public.admin_roles
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.admin_roles enable row level security;

drop policy if exists "admin_roles_read_own" on public.admin_roles;
create policy "admin_roles_read_own"
on public.admin_roles
for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "admin_roles_service_role_all" on public.admin_roles;
create policy "admin_roles_service_role_all"
on public.admin_roles
for all
to service_role
using (true)
with check (true);

create or replace function public.get_admin_role(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select role
  from public.admin_roles
  where user_id = p_user_id
  limit 1;
$$;

create or replace function public.is_admin_user(p_user_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_roles
    where user_id = p_user_id
  );
$$;

revoke all on function public.get_admin_role(uuid) from public;
grant execute on function public.get_admin_role(uuid) to authenticated, service_role;

revoke all on function public.is_admin_user(uuid) from public;
grant execute on function public.is_admin_user(uuid) to authenticated, service_role;

create table if not exists public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  occurred_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text check (actor_role in ('admin', 'super_admin')),
  actor_source text not null check (actor_source in ('supabase_auth', 'fallback_token', 'system')),
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb
);

create index if not exists admin_audit_log_occurred_at_idx
  on public.admin_audit_log(occurred_at desc);
create index if not exists admin_audit_log_action_idx
  on public.admin_audit_log(action);
create index if not exists admin_audit_log_actor_user_idx
  on public.admin_audit_log(actor_user_id);
create index if not exists admin_audit_log_target_idx
  on public.admin_audit_log(target_type, target_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "admin_audit_log_service_role_all" on public.admin_audit_log;
create policy "admin_audit_log_service_role_all"
on public.admin_audit_log
for all
to service_role
using (true)
with check (true);

create table if not exists public.admin_blog_runs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  actor_user_id uuid references auth.users(id) on delete set null,
  actor_role text check (actor_role in ('admin', 'super_admin')),
  actor_source text not null check (actor_source in ('supabase_auth', 'fallback_token', 'system')),
  status text not null default 'started' check (status in ('started', 'success', 'failed')),
  topic text not null,
  slug text,
  research_packet_id text,
  source_count integer check (source_count is null or source_count >= 0),
  error_message text,
  meta jsonb not null default '{}'::jsonb
);

drop trigger if exists trg_admin_blog_runs_updated_at on public.admin_blog_runs;
create trigger trg_admin_blog_runs_updated_at
before update on public.admin_blog_runs
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists admin_blog_runs_created_at_idx
  on public.admin_blog_runs(created_at desc);
create index if not exists admin_blog_runs_status_idx
  on public.admin_blog_runs(status);

alter table public.admin_blog_runs enable row level security;

drop policy if exists "admin_blog_runs_service_role_all" on public.admin_blog_runs;
create policy "admin_blog_runs_service_role_all"
on public.admin_blog_runs
for all
to service_role
using (true)
with check (true);
