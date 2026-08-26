create or replace function public.archive_expired_listings()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  archived_count integer;
begin
  update public.listings
  set status = 'archived'
  where status = 'active'
    and expires_at <= now();
  get diagnostics archived_count = row_count;
  return archived_count;
end;
$$;

revoke all on function public.archive_expired_listings() from public;
grant execute on function public.archive_expired_listings() to anon, authenticated, service_role;
