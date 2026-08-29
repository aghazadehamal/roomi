-- Hard-delete own listings; remove tied conversations (messages cascade).
alter table public.conversations
  drop constraint if exists conversations_listing_id_fkey;

alter table public.conversations
  add constraint conversations_listing_id_fkey
  foreign key (listing_id) references public.listings (id) on delete cascade;

grant delete on table public.listings to authenticated;

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
  on public.listings for delete
  using (auth.uid() = user_id);
