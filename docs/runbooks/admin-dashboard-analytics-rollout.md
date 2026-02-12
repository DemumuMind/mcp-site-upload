# Admin Dashboard Analytics Rollout

## Scope
Apply and verify admin dashboard migration:
- `supabase/migrations/20260210220000_admin_dashboard_analytics.sql`
- `supabase/migrations/20260212190000_admin_auth_audit_blog_runs.sql`

This migration creates persistent tables for:
- system overview metrics
- request distribution analytics
- latest events feed
- admin settings storage
- admin roles and role-based access helpers
- admin audit trail
- admin blog automation run history

## Prerequisites
- Supabase CLI installed (`supabase --version`)
- Project linked to target Supabase project (`supabase link --project-ref <ref>`)
- Network path to remote Postgres is reachable from your execution environment

## Manual Rollout Commands
1. Dry-run remote migration push:
   ```bash
   supabase db push --linked --dry-run --yes
   ```
2. Apply migrations:
   ```bash
   supabase db push --linked --yes
   ```

## If `supabase db push` fails with TLS/DNS errors
Known patterns from restricted environments:
- `tls error (EOF)`
- `hostname resolving error`

Use one of these options:
1. Run the same command from CI runner or another network with DB reachability.
2. Use direct DB URL mode in a trusted environment:
   ```bash
   supabase db push --db-url "postgresql://postgres.<project_ref>:<db_password>@db.<project_ref>.supabase.co:5432/postgres" --yes
   ```

## GitHub Automation (recommended)
Workflow: `.github/workflows/supabase-migrations.yml`

Required repository configuration:
- Variable: `SUPABASE_MIGRATIONS_ENABLED=true`
- Secret: `SUPABASE_DB_URL` (remote Postgres connection string)

Behavior:
- On `push` to `main` with changes in `supabase/migrations/**`:
  1) migration dry-run
  2) migration apply
- On `workflow_dispatch`:
  - `dry_run=true` => validates only
  - `include_all=true` => passes `--include-all`

## Post-Deployment Verification
1. Open `/admin` and confirm:
   - "System overview" is rendered from DB-backed snapshot
   - "Analytics" shows DB-backed distribution/events
   - "Settings" form loads existing values
2. Submit "Save settings" and confirm success banner:
   - `Dashboard settings saved.`
3. Optional SQL checks in Supabase SQL editor:
   ```sql
   select * from public.admin_dashboard_settings;
   select * from public.admin_dashboard_metrics;
   select * from public.admin_server_request_distribution order by request_count desc;
   select * from public.admin_system_events order by occurred_at desc limit 10;
   select * from public.admin_roles;
   select * from public.admin_audit_log order by occurred_at desc limit 20;
   select * from public.admin_blog_runs order by created_at desc limit 20;
   ```

