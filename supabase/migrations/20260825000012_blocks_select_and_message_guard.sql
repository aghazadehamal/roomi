-- Blocked users must see rows where they are blocked_id (for app + RLS checks).
drop policy if exists "blocks_own" on public.blocks;

create policy "blocks_select_participant"
  on public.blocks for select
  using (auth.uid() = blocker_id or auth.uid() = blocked_id);

create policy "blocks_insert_own"
  on public.blocks for insert
  with check (auth.uid() = blocker_id);

create policy "blocks_delete_own"
  on public.blocks for delete
  using (auth.uid() = blocker_id);

-- Enforce block at insert time so blocked peers cannot send messages.
drop policy if exists "messages_insert_participant" on public.messages;

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1
      from public.conversations c
      where c.id = messages.conversation_id
        and (auth.uid() = c.listing_owner_id or auth.uid() = c.guest_id)
    )
    and not exists (
      select 1
      from public.conversations c
      join public.blocks b
        on (
          (b.blocker_id = auth.uid() and b.blocked_id = case
            when c.guest_id = auth.uid() then c.listing_owner_id
            else c.guest_id
          end)
          or (b.blocker_id = case
            when c.guest_id = auth.uid() then c.listing_owner_id
            else c.guest_id
          end and b.blocked_id = auth.uid())
        )
      where c.id = messages.conversation_id
    )
  );
