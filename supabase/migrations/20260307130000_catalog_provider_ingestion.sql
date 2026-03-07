-- Provider-oriented MCP catalog ingestion support tables.

alter table public.catalog_sync_runs
  add column if not exists published integer not null default 0 check (published >= 0),
  add column if not exists quarantined integer not null default 0 check (quarantined >= 0),
  add column if not exists stage_metrics jsonb not null default '{}'::jsonb,
  add column if not exists alerting_summary jsonb not null default '{}'::jsonb;

comment on column public.catalog_sync_runs.published is 'Number of runtime rows published during the sync run.';
comment on column public.catalog_sync_runs.quarantined is 'Number of candidates retained only in ingestion support tables.';
comment on column public.catalog_sync_runs.stage_metrics is 'Per-stage metrics for fetch, normalize, verify, publish, and stale cleanup.';
comment on column public.catalog_sync_runs.alerting_summary is 'Structured alerting summary emitted by sync orchestration.';

create table if not exists public.source_fetch_state (
  id uuid primary key default gen_random_uuid(),
  source_type text not null,
  scope_key text not null,
  last_attempt_at timestamptz,
  last_success_at timestamptz,
  failure_count integer not null default 0 check (failure_count >= 0),
  etag text,
  last_modified text,
  cursor text,
  next_allowed_at timestamptz,
  last_http_status integer,
  last_error text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, scope_key)
);

comment on table public.source_fetch_state is 'Tracks per-source fetch state, retry posture, and conditional request metadata.';
comment on column public.source_fetch_state.source_type is 'Normalized provider identifier such as github, smithery, npm, pypi, or oci.';
comment on column public.source_fetch_state.scope_key is 'Provider-defined scope key, for example a default sweep or package/image seed.';
comment on column public.source_fetch_state.last_attempt_at is 'Timestamp of the latest fetch attempt.';
comment on column public.source_fetch_state.last_success_at is 'Timestamp of the latest successful fetch.';
comment on column public.source_fetch_state.failure_count is 'Consecutive failure count used for backoff and operator visibility.';
comment on column public.source_fetch_state.etag is 'Latest ETag observed for conditional fetches.';
comment on column public.source_fetch_state.last_modified is 'Latest Last-Modified value observed for conditional fetches.';
comment on column public.source_fetch_state.cursor is 'Opaque provider cursor for incremental scans when applicable.';
comment on column public.source_fetch_state.next_allowed_at is 'Timestamp before which the provider should not be polled again.';
comment on column public.source_fetch_state.last_http_status is 'Most recent upstream HTTP status code.';
comment on column public.source_fetch_state.last_error is 'Last sanitized fetch error message.';

drop trigger if exists trg_source_fetch_state_updated_at on public.source_fetch_state;
create trigger trg_source_fetch_state_updated_at
before update on public.source_fetch_state
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists source_fetch_state_last_success_at_idx
  on public.source_fetch_state(last_success_at desc);

create index if not exists source_fetch_state_next_allowed_at_idx
  on public.source_fetch_state(next_allowed_at);

alter table public.source_fetch_state enable row level security;

drop policy if exists "source_fetch_state_service_role_all" on public.source_fetch_state;
create policy "source_fetch_state_service_role_all"
on public.source_fetch_state
for all
to service_role
using (true)
with check (true);

create table if not exists public.source_candidates_raw (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid references public.catalog_sync_runs(id) on delete set null,
  source_type text not null,
  scope_key text not null,
  source_native_id text not null,
  payload_hash text not null,
  payload_bytes integer not null default 0 check (payload_bytes >= 0),
  http_status integer,
  response_headers jsonb not null default '{}'::jsonb,
  provider_transform_version text not null default '2026-03-07',
  raw_payload jsonb not null default '{}'::jsonb,
  normalized_summary jsonb not null default '{}'::jsonb,
  fetched_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.source_candidates_raw is 'Fetch snapshots and normalized summaries for ingestion traceability and debugging.';
comment on column public.source_candidates_raw.sync_run_id is 'Associated catalog sync run when available.';
comment on column public.source_candidates_raw.source_type is 'Provider that emitted the raw candidate.';
comment on column public.source_candidates_raw.scope_key is 'Provider-defined fetch scope key.';
comment on column public.source_candidates_raw.source_native_id is 'Provider-native entity identifier.';
comment on column public.source_candidates_raw.payload_hash is 'Stable hash of the raw payload for dedupe and traceability.';
comment on column public.source_candidates_raw.payload_bytes is 'Serialized payload size in bytes.';
comment on column public.source_candidates_raw.http_status is 'Upstream HTTP status observed when this snapshot was recorded.';
comment on column public.source_candidates_raw.response_headers is 'Selected upstream response headers relevant to caching and diagnostics.';
comment on column public.source_candidates_raw.provider_transform_version is 'Version marker of the normalization logic used for this candidate.';
comment on column public.source_candidates_raw.raw_payload is 'Captured upstream payload as JSON.';
comment on column public.source_candidates_raw.normalized_summary is 'Compact normalized summary derived from the raw payload.';
comment on column public.source_candidates_raw.fetched_at is 'Timestamp when the candidate was fetched from the upstream source.';

drop trigger if exists trg_source_candidates_raw_updated_at on public.source_candidates_raw;
create trigger trg_source_candidates_raw_updated_at
before update on public.source_candidates_raw
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists source_candidates_raw_source_scope_fetched_idx
  on public.source_candidates_raw(source_type, scope_key, fetched_at desc);

create index if not exists source_candidates_raw_payload_hash_idx
  on public.source_candidates_raw(payload_hash);

alter table public.source_candidates_raw enable row level security;

drop policy if exists "source_candidates_raw_service_role_all" on public.source_candidates_raw;
create policy "source_candidates_raw_service_role_all"
on public.source_candidates_raw
for all
to service_role
using (true)
with check (true);

create table if not exists public.server_sources (
  id uuid primary key default gen_random_uuid(),
  server_id uuid references public.servers(id) on delete set null,
  source_type text not null,
  scope_key text not null default 'default',
  source_native_id text not null,
  canonical_name text,
  repo_url text,
  repo_url_normalized text,
  homepage_url text,
  server_url text,
  package_type text,
  package_name text,
  package_version text,
  publish_state text not null default 'pending' check (publish_state in ('pending', 'published', 'quarantined', 'rejected')),
  match_reason text,
  source_metadata jsonb not null default '{}'::jsonb,
  latest_raw_candidate_id uuid,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (source_type, source_native_id)
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'server_sources_latest_raw_candidate_id_fkey'
  ) then
    alter table public.server_sources
      add constraint server_sources_latest_raw_candidate_id_fkey
      foreign key (latest_raw_candidate_id)
      references public.source_candidates_raw(id)
      on delete set null;
  end if;
end
$$;

comment on table public.server_sources is 'Durable linkage between catalog runtime rows and normalized upstream source identities.';
comment on column public.server_sources.server_id is 'Published runtime server row linked to this source identity, if any.';
comment on column public.server_sources.source_type is 'Normalized provider identifier.';
comment on column public.server_sources.scope_key is 'Provider-defined scope key used during fetch.';
comment on column public.server_sources.source_native_id is 'Provider-native entity identifier.';
comment on column public.server_sources.canonical_name is 'Canonicalized source name used for safe dedupe.';
comment on column public.server_sources.repo_url is 'Upstream repository URL after normalization.';
comment on column public.server_sources.repo_url_normalized is 'Identity-safe normalized repository URL.';
comment on column public.server_sources.homepage_url is 'Normalized homepage URL when available.';
comment on column public.server_sources.server_url is 'Normalized server endpoint or launch URL when available.';
comment on column public.server_sources.package_type is 'Package registry type such as npm, pypi, or oci.';
comment on column public.server_sources.package_name is 'Normalized package name for package identity matching.';
comment on column public.server_sources.package_version is 'Latest observed package or image version.';
comment on column public.server_sources.publish_state is 'Most recent publish decision for this source identity.';
comment on column public.server_sources.match_reason is 'Explainability string describing how this identity matched or was protected.';
comment on column public.server_sources.source_metadata is 'Provider-specific metadata and corroboration hints.';
comment on column public.server_sources.latest_raw_candidate_id is 'Most recent raw candidate snapshot linked to this source identity.';
comment on column public.server_sources.first_seen_at is 'Timestamp when this source identity was first observed.';
comment on column public.server_sources.last_seen_at is 'Timestamp when this source identity was most recently observed.';

drop trigger if exists trg_server_sources_updated_at on public.server_sources;
create trigger trg_server_sources_updated_at
before update on public.server_sources
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists server_sources_server_id_idx
  on public.server_sources(server_id);

create index if not exists server_sources_repo_url_normalized_idx
  on public.server_sources(repo_url_normalized);

create index if not exists server_sources_package_identity_idx
  on public.server_sources(package_type, package_name);

create index if not exists server_sources_last_seen_at_idx
  on public.server_sources(last_seen_at desc);

create index if not exists server_sources_publish_state_idx
  on public.server_sources(source_type, publish_state);

alter table public.server_sources enable row level security;

drop policy if exists "server_sources_service_role_all" on public.server_sources;
create policy "server_sources_service_role_all"
on public.server_sources
for all
to service_role
using (true)
with check (true);

create table if not exists public.verification_runs (
  id uuid primary key default gen_random_uuid(),
  sync_run_id uuid references public.catalog_sync_runs(id) on delete set null,
  server_source_id uuid not null references public.server_sources(id) on delete cascade,
  server_id uuid references public.servers(id) on delete set null,
  decision text not null check (decision in ('publish', 'quarantine', 'reject')),
  verification_level text not null default 'community' check (verification_level in ('community', 'partner', 'official')),
  trust_score integer not null default 0 check (trust_score >= 0 and trust_score <= 100),
  reasons jsonb not null default '[]'::jsonb,
  signals jsonb not null default '{}'::jsonb,
  health_summary jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.verification_runs is 'Structured verification and publish-gate outcomes for source identities.';
comment on column public.verification_runs.sync_run_id is 'Catalog sync run that produced this verification decision.';
comment on column public.verification_runs.server_source_id is 'Source identity evaluated by the verification layer.';
comment on column public.verification_runs.server_id is 'Published runtime server row associated with this verification, if any.';
comment on column public.verification_runs.decision is 'Publish-gate decision for the evaluated source identity.';
comment on column public.verification_runs.verification_level is 'Projected runtime verification level when published.';
comment on column public.verification_runs.trust_score is 'Weighted trust score used for publish gating.';
comment on column public.verification_runs.reasons is 'Human-readable reasons supporting the verification decision.';
comment on column public.verification_runs.signals is 'Structured boolean and numeric signals used by verification.';
comment on column public.verification_runs.health_summary is 'Health-check summary captured for verification when available.';

drop trigger if exists trg_verification_runs_updated_at on public.verification_runs;
create trigger trg_verification_runs_updated_at
before update on public.verification_runs
for each row
execute function public.set_current_timestamp_updated_at();

create index if not exists verification_runs_server_source_id_idx
  on public.verification_runs(server_source_id, created_at desc);

create index if not exists verification_runs_server_id_idx
  on public.verification_runs(server_id, created_at desc);

create index if not exists verification_runs_decision_created_at_idx
  on public.verification_runs(decision, created_at desc);

alter table public.verification_runs enable row level security;

drop policy if exists "verification_runs_service_role_all" on public.verification_runs;
create policy "verification_runs_service_role_all"
on public.verification_runs
for all
to service_role
using (true)
with check (true);
