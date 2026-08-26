alter table public.conversations
  add column if not exists guest_last_read_at timestamptz,
  add column if not exists owner_last_read_at timestamptz;

grant update on table public.conversations to authenticated;

drop policy if exists "conversations_update_participant" on public.conversations;
create policy "conversations_update_participant"
  on public.conversations for update
  using (auth.uid() = listing_owner_id or auth.uid() = guest_id)
  with check (auth.uid() = listing_owner_id or auth.uid() = guest_id);

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
  return new;
end;
$$;

drop trigger if exists conversations_protect_identity on public.conversations;
create trigger conversations_protect_identity
  before update on public.conversations
  for each row execute function public.conversations_protect_identity();

alter table public.conversations replica identity full;

do $$
begin
  alter publication supabase_realtime add table public.conversations;
exception
  when duplicate_object then null;
end $$;
