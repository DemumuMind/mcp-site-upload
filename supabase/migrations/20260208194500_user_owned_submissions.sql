-- User-owned submissions for account cabinet and stricter auth submit flow

alter table public.servers
add column if not exists owner_user_id uuid references auth.users(id) on delete set null;

create index if not exists servers_owner_user_id_created_at_idx
  on public.servers(owner_user_id, created_at desc);

drop policy if exists "servers_anon_insert_pending" on public.servers;
drop policy if exists "servers_auth_insert_pending" on public.servers;

create policy "servers_auth_insert_owned_pending"
on public.servers
for insert
to authenticated
with check (
  status = 'pending'
  and owner_user_id = auth.uid()
);

drop policy if exists "servers_auth_read_own" on public.servers;
create policy "servers_auth_read_own"
on public.servers
for select
to authenticated
using (owner_user_id = auth.uid());
