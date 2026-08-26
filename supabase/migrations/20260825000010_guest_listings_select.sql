-- Guests (anon) must read active listings on the public feed.
grant usage on schema public to anon, authenticated;

grant select on table public.profiles to anon, authenticated;
grant select on table public.listings to anon, authenticated;
grant select on table public.listing_photos to anon, authenticated;

drop policy if exists "listings_select_active" on public.listings;
create policy "listings_select_active"
  on public.listings for select
  to anon, authenticated
  using (status = 'active' or user_id = auth.uid());

drop policy if exists "listing_photos_select" on public.listing_photos;
create policy "listing_photos_select"
  on public.listing_photos for select
  to anon, authenticated
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
        and (listings.status = 'active' or listings.user_id = auth.uid())
    )
  );
