-- Add health check metadata fields for MCP servers.

alter table public.servers
  add column if not exists health_status text not null default 'unknown'
  check (health_status in ('unknown', 'healthy', 'degraded', 'down'));

alter table public.servers
  add column if not exists health_checked_at timestamptz;

alter table public.servers
  add column if not exists health_error text;

create index if not exists servers_health_status_idx on public.servers(health_status);
create index if not exists servers_health_checked_at_idx on public.servers(health_checked_at desc);
