-- Admin dashboard analytics and settings persistence.

create table if not exists public.admin_dashboard_settings (
  id integer primary key default 1 check (id = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  status_update_interval_sec integer not null default 5 check (status_update_interval_sec between 1 and 300),
  request_limit_per_minute integer not null default 1000 check (request_limit_per_minute between 1 and 100000),
  notify_email_on_errors boolean not null default true,
  notify_push_notifications boolean not null default false,
  notify_webhook_integrations boolean not null default true
);

drop trigger if exists trg_admin_dashboard_settings_updated_at on public.admin_dashboard_settings;
create trigger trg_admin_dashboard_settings_updated_at
before update on public.admin_dashboard_settings
for each row
execute function public.set_current_timestamp_updated_at();

insert into public.admin_dashboard_settings (
  id,
  status_update_interval_sec,
  request_limit_per_minute,
  notify_email_on_errors,
  notify_push_notifications,
  notify_webhook_integrations
)
values (1, 5, 1000, true, false, true)
on conflict (id) do nothing;

create table if not exists public.admin_dashboard_metrics (
  id integer primary key default 1 check (id = 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  total_requests bigint not null default 0 check (total_requests >= 0),
  average_latency_ms integer not null default 0 check (average_latency_ms >= 0),
  uptime_percent numeric(5, 2) not null default 99.9 check (uptime_percent >= 0 and uptime_percent <= 100)
);

drop trigger if exists trg_admin_dashboard_metrics_updated_at on public.admin_dashboard_metrics;
create trigger trg_admin_dashboard_metrics_updated_at
before update on public.admin_dashboard_metrics
for each row
execute function public.set_current_timestamp_updated_at();

insert into public.admin_dashboard_metrics (id, total_requests, average_latency_ms, uptime_percent)
values (1, 847000, 45, 99.9)
on conflict (id) do nothing;

create table if not exists public.admin_server_request_distribution (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  server_slug text not null unique,
  server_name text not null,
  request_count bigint not null default 0 check (request_count >= 0)
);

drop trigger if exists trg_admin_server_request_distribution_updated_at on public.admin_server_request_distribution;
create trigger trg_admin_server_request_distribution_updated_at
before update on public.admin_server_request_distribution
for each row
execute function public.set_current_timestamp_updated_at();

insert into public.admin_server_request_distribution (server_slug, server_name, request_count)
values
  ('gateway-01', 'gateway-01', 241000),
  ('gateway-02', 'gateway-02', 198000),
  ('gateway-03', 'gateway-03', 153000),
  ('gateway-04', 'gateway-04', 127000),
  ('gateway-05', 'gateway-05', 128000)
on conflict (server_slug) do nothing;

create table if not exists public.admin_system_events (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  occurred_at timestamptz not null default now(),
  level text not null default 'info' check (level in ('info', 'success', 'warning', 'error')),
  message_en text not null,
  message_ru text not null
);

create index if not exists admin_system_events_occurred_at_idx
  on public.admin_system_events(occurred_at desc);

insert into public.admin_system_events (occurred_at, level, message_en, message_ru)
values
  (now() - interval '5 minutes', 'success', 'gateway-02 latency returned to baseline', 'gateway-02: задержка вернулась в норму'),
  (now() - interval '18 minutes', 'warning', 'Webhook delivery retried for 4 endpoints', 'Повторная доставка webhook для 4 endpoint'),
  (now() - interval '32 minutes', 'error', 'Rate limit reached on gateway-04', 'Достигнут лимит запросов на gateway-04'),
  (now() - interval '47 minutes', 'success', 'Health check passed for all active servers', 'Health-check пройден для всех активных серверов');

alter table public.admin_dashboard_settings enable row level security;
alter table public.admin_dashboard_metrics enable row level security;
alter table public.admin_server_request_distribution enable row level security;
alter table public.admin_system_events enable row level security;

drop policy if exists "admin_dashboard_settings_service_role_all" on public.admin_dashboard_settings;
create policy "admin_dashboard_settings_service_role_all"
on public.admin_dashboard_settings
for all
to service_role
using (true)
with check (true);

drop policy if exists "admin_dashboard_metrics_service_role_all" on public.admin_dashboard_metrics;
create policy "admin_dashboard_metrics_service_role_all"
on public.admin_dashboard_metrics
for all
to service_role
using (true)
with check (true);

drop policy if exists "admin_server_request_distribution_service_role_all" on public.admin_server_request_distribution;
create policy "admin_server_request_distribution_service_role_all"
on public.admin_server_request_distribution
for all
to service_role
using (true)
with check (true);

drop policy if exists "admin_system_events_service_role_all" on public.admin_system_events;
create policy "admin_system_events_service_role_all"
on public.admin_system_events
for all
to service_role
using (true)
with check (true);

