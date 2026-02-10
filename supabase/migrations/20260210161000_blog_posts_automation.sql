-- Blog posts storage for production-safe automation.
-- Keeps generated posts in Postgres so cron publishing works on read-only runtimes.

create extension if not exists pgcrypto;

create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  slug text not null unique,
  tags text[] not null default '{}',
  published_at timestamptz not null default now(),
  read_time_minutes integer not null check (read_time_minutes > 0),
  featured boolean not null default false,
  cover_image text,
  locale jsonb not null,
  research jsonb
);

create index if not exists blog_posts_published_at_idx
  on public.blog_posts(published_at desc);
create index if not exists blog_posts_tags_gin_idx
  on public.blog_posts using gin(tags);

drop trigger if exists trg_blog_posts_updated_at on public.blog_posts;
create trigger trg_blog_posts_updated_at
before update on public.blog_posts
for each row
execute function public.set_current_timestamp_updated_at();

alter table public.blog_posts enable row level security;

drop policy if exists "blog_posts_public_read" on public.blog_posts;
create policy "blog_posts_public_read"
on public.blog_posts
for select
to anon, authenticated
using (true);

drop policy if exists "blog_posts_service_role_all" on public.blog_posts;
create policy "blog_posts_service_role_all"
on public.blog_posts
for all
to service_role
using (true)
with check (true);
