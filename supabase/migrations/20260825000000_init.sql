create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  name text not null default '',
  avatar_url text,
  city text not null default 'Bakı',
  role_intent text not null default 'seek_home'
    check (role_intent in ('offer', 'seek_home', 'seek_roommate')),
  created_at timestamptz not null default now()
);

create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null
    check (type in ('home_offer', 'room_offer', 'home_seek', 'roommate_seek')),
  title text not null,
  body text not null,
  city text not null,
  district text not null,
  price integer not null,
  rooms integer not null,
  gender_pref text not null default 'any'
    check (gender_pref in ('any', 'female', 'male')),
  status text not null default 'active'
    check (status in ('active', 'archived', 'closed')),
  published_at timestamptz not null default now(),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create unique index if not exists listings_one_active_per_user
  on public.listings (user_id)
  where status = 'active';

create table if not exists public.listing_photos (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  url text not null,
  sort_order integer not null default 0
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete restrict,
  listing_owner_id uuid not null references public.profiles (id) on delete cascade,
  guest_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, guest_id),
  check (listing_owner_id <> guest_id)
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.blocks (
  blocker_id uuid not null references public.profiles (id) on delete cascade,
  blocked_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (blocker_id, blocked_id),
  check (blocker_id <> blocked_id)
);

create table if not exists public.reports (
  id uuid primary key default gen_random_uuid(),
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid references public.listings (id) on delete set null,
  conversation_id uuid references public.conversations (id) on delete set null,
  reason text not null,
  body text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.listing_photos enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.blocks enable row level security;
alter table public.reports enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "listings_select_active"
  on public.listings for select
  using (status = 'active' or user_id = auth.uid());

create policy "listings_insert_own"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "listings_update_own"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "listing_photos_select"
  on public.listing_photos for select
  using (
    exists (
      select 1 from public.listings
      where listings.id = listing_photos.listing_id
        and (listings.status = 'active' or listings.user_id = auth.uid())
    )
  );

create policy "conversations_select_participant"
  on public.conversations for select
  using (auth.uid() = listing_owner_id or auth.uid() = guest_id);

create policy "conversations_insert_guest"
  on public.conversations for insert
  with check (auth.uid() = guest_id and auth.uid() <> listing_owner_id);

create policy "messages_select_participant"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (auth.uid() = conversations.listing_owner_id or auth.uid() = conversations.guest_id)
    )
  );

create policy "messages_insert_participant"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations
      where conversations.id = messages.conversation_id
        and (auth.uid() = conversations.listing_owner_id or auth.uid() = conversations.guest_id)
    )
  );

create policy "blocks_own"
  on public.blocks for all
  using (auth.uid() = blocker_id)
  with check (auth.uid() = blocker_id);

create policy "reports_insert_own"
  on public.reports for insert
  with check (auth.uid() = reporter_id);
