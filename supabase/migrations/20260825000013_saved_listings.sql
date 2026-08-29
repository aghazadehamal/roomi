create table if not exists public.saved_listings (
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, listing_id)
);

alter table public.saved_listings enable row level security;

create policy "saved_listings_own"
  on public.saved_listings for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

grant select, insert, delete on table public.saved_listings to authenticated;
