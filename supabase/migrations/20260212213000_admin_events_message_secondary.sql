-- Rename legacy admin_system_events secondary message column.

do $$
begin
  if exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_system_events'
      and column_name = 'message_ru'
  ) and not exists (
    select 1
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'admin_system_events'
      and column_name = 'message_secondary'
  ) then
    alter table public.admin_system_events
      rename column message_ru to message_secondary;
  end if;
end
$$;
