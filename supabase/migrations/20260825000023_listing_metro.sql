-- Bakı metro stansiyası
alter table public.listings
  add column if not exists metro text not null default 'Fərqi yoxdur';
