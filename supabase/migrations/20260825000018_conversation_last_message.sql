-- Denormalize last message on conversations (avoids messages scan in list RPC)
alter table public.conversations
  add column if not exists last_message_body text,
  add column if not exists last_message_at timestamptz;

update public.conversations c
set
  last_message_body = lm.body,
  last_message_at = lm.created_at
from (
  select distinct on (conversation_id)
    conversation_id,
    body,
    created_at
  from public.messages
  order by conversation_id, created_at desc
) lm
where c.id = lm.conversation_id;

create or replace function public.conversations_sync_last_message()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations
  set
    last_message_body = new.body,
    last_message_at = new.created_at
  where id = new.conversation_id;
  return new;
end;
$$;

drop trigger if exists messages_sync_conversation_last on public.messages;
create trigger messages_sync_conversation_last
  after insert on public.messages
  for each row execute function public.conversations_sync_last_message();

create or replace function public.conversations_protect_identity()
returns trigger
language plpgsql
as $$
begin
  if new.listing_id is distinct from old.listing_id
    or new.listing_owner_id is distinct from old.listing_owner_id
    or new.guest_id is distinct from old.guest_id then
    raise exception 'conversation identity cannot change';
  end if;

  if (new.last_message_body is distinct from old.last_message_body
      or new.last_message_at is distinct from old.last_message_at)
     and pg_trigger_depth() <= 1 then
    raise exception 'last message fields are read-only';
  end if;

  return new;
end;
$$;

create index if not exists conversations_last_message_at_idx
  on public.conversations (last_message_at desc nulls last);

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
    coalesce(mine.last_message_body, 'Hələ mesaj yoxdur') as last_message,
    coalesce(mine.last_message_at, mine.created_at) as last_message_at,
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
  left join public.listings l on l.id = mine.listing_id
  left join public.profiles p on p.id = case
    when auth.uid() = mine.guest_id then mine.listing_owner_id
    else mine.guest_id
  end
  order by coalesce(mine.last_message_at, mine.created_at) desc;
$$;

create or replace function public.users_are_blocked(user_a uuid, user_b uuid)
returns boolean
language sql
stable
security invoker
set search_path = public
as $$
  select user_a is distinct from user_b
    and exists (
      select 1
      from public.blocks b
      where (b.blocker_id = user_a and b.blocked_id = user_b)
         or (b.blocker_id = user_b and b.blocked_id = user_a)
    );
$$;

revoke all on function public.users_are_blocked(uuid, uuid) from public;
grant execute on function public.users_are_blocked(uuid, uuid) to authenticated;
