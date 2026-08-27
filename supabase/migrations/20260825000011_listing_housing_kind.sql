-- Həyət evi / bina evi (və axtarışda "fərqi yoxdur")
alter table public.listings
  add column if not exists housing_kind text not null default 'apartment';

alter table public.listings
  drop constraint if exists listings_housing_kind_check;

alter table public.listings
  add constraint listings_housing_kind_check
  check (housing_kind in ('apartment', 'house', 'any'));
