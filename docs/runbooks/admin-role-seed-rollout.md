# Admin role seed + rollout checklist (staging/prod)

## Purpose
Safely grant first admin access after deploying:
- `supabase/migrations/20260212190000_admin_auth_audit_blog_runs.sql`

This runbook covers:
1) SQL seed for `public.admin_roles`
2) verification checks
3) staged rollout from `hybrid` to `supabase` auth mode
4) rollback

---

## 1) Pre-checks

1. Ensure migration is applied:
   ```bash
   supabase db push --linked --yes
   ```
2. Ensure app env is currently in hybrid mode:
   - `ADMIN_AUTH_MODE=hybrid`
   - `ADMIN_FALLBACK_TOKEN_ENABLED=true`
3. Ensure at least one user can sign in via Supabase Auth (Google/GitHub/email).

---

## 2) Safe SQL seed script (copy/paste)

> Run in Supabase SQL Editor (staging first, then production).
>
> Ready-to-copy staging/prod blocks:
> - `docs/runbooks/sql/admin-role-seed-staging-prod.sql`

```sql
-- Replace with target email of the admin account.
-- Example: admin@company.com
do $$
declare
  v_email text := 'admin@company.com';
  v_user_id uuid;
begin
  select id
  into v_user_id
  from auth.users
  where lower(email) = lower(v_email)
  limit 1;

  if v_user_id is null then
    raise exception 'User with email % not found in auth.users', v_email;
  end if;

  insert into public.admin_roles (user_id, role, created_by)
  values (v_user_id, 'super_admin', v_user_id)
  on conflict (user_id)
  do update
    set role = excluded.role,
        updated_at = now();
end $$;
```

Optional: grant regular admin role:

```sql
insert into public.admin_roles (user_id, role)
values ('00000000-0000-0000-0000-000000000000'::uuid, 'admin')
on conflict (user_id) do update
set role = excluded.role, updated_at = now();
```

---

## 3) Verification SQL

```sql
select user_id, role, created_at, updated_at
from public.admin_roles
order by updated_at desc;

select public.get_admin_role(user_id) as role_check, user_id
from public.admin_roles
limit 10;

select id, occurred_at, action, actor_source, target_type, target_id
from public.admin_audit_log
order by occurred_at desc
limit 20;
```

Expected:
- seeded account exists in `admin_roles`
- role is `admin` or `super_admin`
- new `/admin` actions start writing into `admin_audit_log`

---

## 4) Functional verification (staging first)

1. Login with seeded account via Supabase auth (`/admin/login` -> “Continue with Supabase auth”).
2. Open `/admin`:
   - edit settings -> success banner
   - edit metrics -> success banner
   - create/delete event -> success banners
   - confirm new rows in audit timeline
3. Open `/admin/blog`:
   - run one automation job
   - confirm row appears in “Recent automation runs”

---

## 5) Rollout checklist

### Stage A (safe launch)
- Keep:
  - `ADMIN_AUTH_MODE=hybrid`
  - `ADMIN_FALLBACK_TOKEN_ENABLED=true`
- Observe 24-48h:
  - admin logins through Supabase role work
  - audit rows are present for key actions

### Stage B (tighten access)
- Switch:
  - `ADMIN_AUTH_MODE=supabase`
- Keep token configured for emergency rollback only.
- Observe another 24h.

### Stage C (finalize)
- Set:
  - `ADMIN_FALLBACK_TOKEN_ENABLED=false` (if hybrid mode reused later)
- Rotate/remove `ADMIN_ACCESS_TOKEN` from runtime secrets when no longer needed.

---

## 6) Rollback

If role-based flow fails:

1. Immediate access restore:
   - set `ADMIN_AUTH_MODE=hybrid`
   - set `ADMIN_FALLBACK_TOKEN_ENABLED=true`
2. Validate fallback token login at `/admin/login`.
3. Investigate:
   - missing `admin_roles` row
   - Supabase Auth callback/session issues
   - env mismatch between staging/prod

To revoke accidentally granted admin role:

```sql
delete from public.admin_roles
where user_id = '00000000-0000-0000-0000-000000000000'::uuid;
```
