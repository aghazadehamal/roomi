-- Cover photo lookups per listing
create index if not exists listing_photos_listing_sort_idx
  on public.listing_photos (listing_id, sort_order);

-- Filtered feed queries on active listings
create index if not exists listings_active_city_feed_idx
  on public.listings (city, published_at desc)
  where status = 'active';

create index if not exists listings_active_city_district_feed_idx
  on public.listings (city, district, published_at desc)
  where status = 'active';

create index if not exists listings_active_price_feed_idx
  on public.listings (price, published_at desc)
  where status = 'active';

create index if not exists listings_active_rooms_feed_idx
  on public.listings (rooms, published_at desc)
  where status = 'active';

create index if not exists listings_active_housing_kind_feed_idx
  on public.listings (housing_kind, published_at desc)
  where status = 'active';
