-- Gündəlik / uzunmüddətli kirayə
alter table public.listings
  add column if not exists rental_term text not null default 'long_term';

alter table public.listings
  drop constraint if exists listings_rental_term_check;

alter table public.listings
  add constraint listings_rental_term_check
  check (rental_term in ('daily', 'long_term'));
