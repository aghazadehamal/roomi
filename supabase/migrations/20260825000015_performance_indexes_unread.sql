-- Feed listing queries: active + type + published_at sort
create index if not exists listings_active_feed_idx
  on public.listings (type, published_at desc)
  where status = 'active';

-- Conversation lists and unread checks
create index if not exists conversations_owner_created_idx
  on public.conversations (listing_owner_id, created_at desc);

create index if not exists conversations_guest_created_idx
  on public.conversations (guest_id, created_at desc);

-- Last message / unread lookups per conversation
create index if not exists messages_conversation_created_idx
  on public.messages (conversation_id, created_at desc);

create index if not exists messages_conversation_sender_idx
  on public.messages (conversation_id, sender_id);

-- Fast unread badge: one query instead of loading all messages
create or replace function public.count_unread_messages()
returns integer
language sql
stable
security invoker
set search_path = public
as $$
  select count(*)::integer
  from public.messages m
  inner join public.conversations c on c.id = m.conversation_id
  where auth.uid() is not null
    and m.sender_id <> auth.uid()
    and (auth.uid() = c.guest_id or auth.uid() = c.listing_owner_id)
    and m.created_at > coalesce(
      case
        when auth.uid() = c.guest_id then c.guest_last_read_at
        else c.owner_last_read_at
      end,
      '-infinity'::timestamptz
    );
$$;

revoke all on function public.count_unread_messages() from public;
grant execute on function public.count_unread_messages() to authenticated;
