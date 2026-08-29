-- Conversation list: last message + unread in one query (no full message scan)
create or replace function public.list_conversations_for_user()
returns table (
  id uuid,
  peer_id uuid,
  peer_name text,
  listing_title text,
  listing_active boolean,
  last_message text,
  last_message_at timestamptz,
  unread boolean
)
language sql
stable
security invoker
set search_path = public
as $$
  with mine as (
    select c.*
    from public.conversations c
    where auth.uid() is not null
      and (auth.uid() = c.guest_id or auth.uid() = c.listing_owner_id)
  ),
  last_msg as (
    select distinct on (m.conversation_id)
      m.conversation_id,
      m.body,
      m.created_at
    from public.messages m
    inner join mine on mine.id = m.conversation_id
    order by m.conversation_id, m.created_at desc
  )
  select
    mine.id,
    case
      when auth.uid() = mine.guest_id then mine.listing_owner_id
      else mine.guest_id
    end as peer_id,
    coalesce(nullif(trim(p.name), ''), 'İstifadəçi') as peer_name,
    coalesce(l.title, 'Elan') as listing_title,
    (l.status = 'active') as listing_active,
    coalesce(last_msg.body, 'Hələ mesaj yoxdur') as last_message,
    coalesce(last_msg.created_at, mine.created_at) as last_message_at,
    exists (
      select 1
      from public.messages um
      where um.conversation_id = mine.id
        and um.sender_id <> auth.uid()
        and um.created_at > coalesce(
          case
            when auth.uid() = mine.guest_id then mine.guest_last_read_at
            else mine.owner_last_read_at
          end,
          '-infinity'::timestamptz
        )
    ) as unread
  from mine
  left join last_msg on last_msg.conversation_id = mine.id
  left join public.listings l on l.id = mine.listing_id
  left join public.profiles p on p.id = case
    when auth.uid() = mine.guest_id then mine.listing_owner_id
    else mine.guest_id
  end
  order by coalesce(last_msg.created_at, mine.created_at) desc;
$$;

revoke all on function public.list_conversations_for_user() from public;
grant execute on function public.list_conversations_for_user() to authenticated;

-- Saved listings lookup on profile
create index if not exists saved_listings_user_created_idx
  on public.saved_listings (user_id, created_at desc);
