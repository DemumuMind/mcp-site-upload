-- DemumuMind MCP initial schema
-- Source: Plan-site docs (system/spec/dev-plan)

create extension if not exists pgcrypto;

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.maintainers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.servers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  slug text not null unique,
  description text,
  server_url text,
  category text,
  category_id uuid references public.categories(id) on delete set null,
  auth_type text not null default 'none' check (auth_type in ('oauth', 'api_key', 'none')),
  tags text[] not null default '{}',
  repo_url text,
  maintainer jsonb,
  maintainer_id uuid references public.maintainers(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'active', 'rejected')),
  verification_level text not null default 'community' check (verification_level in ('community', 'partner', 'official'))
);

create index if not exists servers_status_idx on public.servers(status);
create index if not exists servers_auth_type_idx on public.servers(auth_type);
create index if not exists servers_category_idx on public.servers(category);
create index if not exists servers_created_at_idx on public.servers(created_at desc);
create index if not exists servers_tags_gin_idx on public.servers using gin(tags);
create index if not exists servers_name_description_fts_idx
  on public.servers
  using gin(to_tsvector('simple', coalesce(name, '') || ' ' || coalesce(description, '')));

create or replace function public.set_current_timestamp_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_servers_updated_at on public.servers;
create trigger trg_servers_updated_at
before update on public.servers
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.categories enable row level security;
alter table public.maintainers enable row level security;
alter table public.servers enable row level security;

-- Categories: publicly readable, admin-managed.
drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read"
on public.categories
for select
to anon, authenticated
using (true);

drop policy if exists "categories_service_role_all" on public.categories;
create policy "categories_service_role_all"
on public.categories
for all
to service_role
using (true)
with check (true);

-- Maintainers: private by default, service role only.
drop policy if exists "maintainers_service_role_all" on public.maintainers;
create policy "maintainers_service_role_all"
on public.maintainers
for all
to service_role
using (true)
with check (true);

-- Servers: public can read only active rows.
drop policy if exists "servers_public_read_active" on public.servers;
create policy "servers_public_read_active"
on public.servers
for select
to anon, authenticated
using (status = 'active');

-- Open submission path for anonymous users; status is restricted to pending.
drop policy if exists "servers_anon_insert_pending" on public.servers;
create policy "servers_anon_insert_pending"
on public.servers
for insert
to anon
with check (status = 'pending');

drop policy if exists "servers_auth_insert_pending" on public.servers;
create policy "servers_auth_insert_pending"
on public.servers
for insert
to authenticated
with check (status = 'pending');

drop policy if exists "servers_service_role_all" on public.servers;
create policy "servers_service_role_all"
on public.servers
for all
to service_role
using (true)
with check (true);
