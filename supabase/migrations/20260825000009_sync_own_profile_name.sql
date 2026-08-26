create or replace function public.sync_own_profile_name()
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  auth_name text;
  profile_name text;
begin
  if auth.uid() is null then
    return '';
  end if;

  select coalesce(
    nullif(trim(raw_user_meta_data->>'name'), ''),
    nullif(trim(raw_user_meta_data->>'full_name'), ''),
    ''
  )
  into auth_name
  from auth.users
  where id = auth.uid();

  select nullif(trim(name), '')
  into profile_name
  from public.profiles
  where id = auth.uid();

  if profile_name is not null then
    return profile_name;
  end if;

  if coalesce(auth_name, '') = '' then
    return '';
  end if;

  insert into public.profiles (id, name)
  values (auth.uid(), auth_name)
  on conflict (id) do update
    set name = excluded.name
    where public.profiles.name = '';

  return auth_name;
end;
$$;

revoke all on function public.sync_own_profile_name() from public, anon;
grant execute on function public.sync_own_profile_name() to authenticated;

update public.profiles as p
set name = coalesce(
  nullif(trim(u.raw_user_meta_data->>'name'), ''),
  nullif(trim(u.raw_user_meta_data->>'full_name'), ''),
  p.name
)
from auth.users as u
where u.id = p.id
  and trim(p.name) = ''
  and (
    nullif(trim(u.raw_user_meta_data->>'name'), '') is not null
    or nullif(trim(u.raw_user_meta_data->>'full_name'), '') is not null
  );
