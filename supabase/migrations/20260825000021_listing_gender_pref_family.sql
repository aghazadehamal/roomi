-- Ev/otaq kirayədə "kimə: ailə" seçimi
alter table public.listings
  drop constraint if exists listings_gender_pref_check;

alter table public.listings
  add constraint listings_gender_pref_check
  check (gender_pref in ('any', 'female', 'male', 'family'));
