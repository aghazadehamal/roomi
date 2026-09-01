-- Launch: allow multiple active listings per user (app limit via PRODUCT_MAX_ACTIVE_LISTINGS).
-- To restore DB cap later, run:
--   create unique index listings_one_active_per_user
--     on public.listings (user_id) where status = 'active';
drop index if exists public.listings_one_active_per_user;
