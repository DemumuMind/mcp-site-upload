create table if not exists public.auth_security_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default timezone('utc', now()),
  event_type text not null,
  user_id uuid null references auth.users(id) on delete set null,
  email text null,
  email_hash text null,
  ip_address inet null,
  user_agent text null,
  metadata jsonb not null default '{}'::jsonb,
  constraint auth_security_events_event_type_check check (
    event_type in (
      'login_success',
      'login_failure',
      'login_rate_limited',
      'password_reset_request',
      'password_reset_success',
      'logout'
    )
  )
);

create index if not exists auth_security_events_created_at_idx
  on public.auth_security_events (created_at desc);

create index if not exists auth_security_events_email_hash_created_at_idx
  on public.auth_security_events (email_hash, created_at desc);

create index if not exists auth_security_events_user_id_created_at_idx
  on public.auth_security_events (user_id, created_at desc);

create index if not exists auth_security_events_event_type_created_at_idx
  on public.auth_security_events (event_type, created_at desc);

alter table public.auth_security_events enable row level security;

drop policy if exists "auth_security_events_service_role_all" on public.auth_security_events;
create policy "auth_security_events_service_role_all"
on public.auth_security_events
for all
to service_role
using (true)
with check (true);

drop policy if exists "auth_security_events_user_select_own" on public.auth_security_events;
create policy "auth_security_events_user_select_own"
on public.auth_security_events
for select
to authenticated
using (user_id = auth.uid());
