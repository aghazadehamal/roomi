-- Bina evində binanın ümumi mərtəbə sayı
alter table public.listings
  add column if not exists building_floors integer not null default 0;

alter table public.listings
  drop constraint if exists listings_building_floors_check;

alter table public.listings
  add constraint listings_building_floors_check
  check (building_floors >= 0 and building_floors <= 50);
