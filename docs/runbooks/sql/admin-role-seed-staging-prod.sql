-- Admin role seed script for staging and production.
-- IMPORTANT:
-- 1) Replace emails before running.
-- 2) Run staging block first, then production block.
-- 3) Users must already exist in auth.users.

-- ===========================================
-- STAGING
-- ===========================================
do $$
declare
  v_super_admin_email text := 'dezveer2@gmail.com';
  -- Optional second admin (set to NULL to skip).
  v_admin_email text := null;
  v_super_admin_user_id uuid;
  v_admin_user_id uuid;
begin
  select id into v_super_admin_user_id
  from auth.users
  where lower(email) = lower(v_super_admin_email)
  limit 1;

  if v_super_admin_user_id is null then
    raise exception 'Staging super admin email % not found in auth.users', v_super_admin_email;
  end if;

  insert into public.admin_roles (user_id, role, created_by)
  values (v_super_admin_user_id, 'super_admin', v_super_admin_user_id)
  on conflict (user_id)
  do update
    set role = excluded.role,
        updated_at = now();

  if v_admin_email is not null then
    select id into v_admin_user_id
    from auth.users
    where lower(email) = lower(v_admin_email)
    limit 1;

    if v_admin_user_id is null then
      raise exception 'Staging admin email % not found in auth.users', v_admin_email;
    end if;

    insert into public.admin_roles (user_id, role, created_by)
    values (v_admin_user_id, 'admin', v_super_admin_user_id)
    on conflict (user_id)
    do update
      set role = excluded.role,
          updated_at = now();
  end if;
end $$;

-- Verification (staging)
select u.email, r.role, r.created_at, r.updated_at
from public.admin_roles r
join auth.users u on u.id = r.user_id
where lower(u.email) in (
  lower('dezveer2@gmail.com')
)
order by r.updated_at desc;


-- ===========================================
-- PRODUCTION
-- ===========================================
do $$
declare
  v_super_admin_email text := 'dezveer2@gmail.com';
  -- Optional second admin (set to NULL to skip).
  v_admin_email text := null;
  v_super_admin_user_id uuid;
  v_admin_user_id uuid;
begin
  select id into v_super_admin_user_id
  from auth.users
  where lower(email) = lower(v_super_admin_email)
  limit 1;

  if v_super_admin_user_id is null then
    raise exception 'Production super admin email % not found in auth.users', v_super_admin_email;
  end if;

  insert into public.admin_roles (user_id, role, created_by)
  values (v_super_admin_user_id, 'super_admin', v_super_admin_user_id)
  on conflict (user_id)
  do update
    set role = excluded.role,
        updated_at = now();

  if v_admin_email is not null then
    select id into v_admin_user_id
    from auth.users
    where lower(email) = lower(v_admin_email)
    limit 1;

    if v_admin_user_id is null then
      raise exception 'Production admin email % not found in auth.users', v_admin_email;
    end if;

    insert into public.admin_roles (user_id, role, created_by)
    values (v_admin_user_id, 'admin', v_super_admin_user_id)
    on conflict (user_id)
    do update
      set role = excluded.role,
          updated_at = now();
  end if;
end $$;

-- Verification (production)
select u.email, r.role, r.created_at, r.updated_at
from public.admin_roles r
join auth.users u on u.id = r.user_id
where lower(u.email) in (
  lower('dezveer2@gmail.com')
)
order by r.updated_at desc;
