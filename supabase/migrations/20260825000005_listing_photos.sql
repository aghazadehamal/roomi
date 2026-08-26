insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-photos',
  'listing-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "listing_photos_select_public" on storage.objects;
create policy "listing_photos_select_public"
  on storage.objects for select
  using (bucket_id = 'listing-photos');

drop policy if exists "listing_photos_insert_own" on storage.objects;
create policy "listing_photos_insert_own"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "listing_photos_delete_own" on storage.objects;
create policy "listing_photos_delete_own"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'listing-photos'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "listing_photos_insert_owner" on public.listing_photos;
create policy "listing_photos_insert_owner"
  on public.listing_photos for insert
  with check (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
        and listings.user_id = auth.uid()
    )
  );

drop policy if exists "listing_photos_delete_owner" on public.listing_photos;
create policy "listing_photos_delete_owner"
  on public.listing_photos for delete
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
        and listings.user_id = auth.uid()
    )
  );
