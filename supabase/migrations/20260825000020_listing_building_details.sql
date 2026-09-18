-- Tikili növü, mərtəbə, sahə (m²)
alter table public.listings
  add column if not exists building_age text not null default 'any';

alter table public.listings
  drop constraint if exists listings_building_age_check;

alter table public.listings
  add constraint listings_building_age_check
  check (building_age in ('old', 'new', 'any'));

alter table public.listings
  add column if not exists floor integer not null default 0;

alter table public.listings
  drop constraint if exists listings_floor_check;

alter table public.listings
  add constraint listings_floor_check
  check (floor >= 0 and floor <= 50);

alter table public.listings
  add column if not exists area_sqm integer not null default 0;

alter table public.listings
  drop constraint if exists listings_area_sqm_check;

alter table public.listings
  add constraint listings_area_sqm_check
  check (area_sqm >= 0 and area_sqm <= 10_000);
