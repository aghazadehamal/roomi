grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant insert, update on table public.profiles to authenticated;

grant select on table public.listings to anon, authenticated;
grant insert, update on table public.listings to authenticated;

grant select on table public.listing_photos to anon, authenticated;
grant insert, update, delete on table public.listing_photos to authenticated;

grant select, insert on table public.conversations to authenticated;
grant select, insert on table public.messages to authenticated;
grant select, insert, delete on table public.blocks to authenticated;
grant select, insert on table public.reports to authenticated;

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);
