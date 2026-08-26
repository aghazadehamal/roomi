create policy "listings_select_conversation_participant"
  on public.listings for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.listing_id = listings.id
        and (
          auth.uid() = conversations.listing_owner_id
          or auth.uid() = conversations.guest_id
        )
    )
  );

alter table public.messages replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.messages;
exception
  when duplicate_object then null;
end $$;
