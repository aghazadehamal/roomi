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
