-- ============================================================
-- PRODUCT CATEGORY — RLS
-- ============================================================

alter table product_category enable row level security;

-- Public read (catalog)
drop policy if exists allow_read_product_category on product_category;
create policy allow_read_product_category
on product_category
for select
to anon, authenticated
using (true);

-- Admin full access
drop policy if exists admin_all_product_category on product_category;
create policy admin_all_product_category
on product_category
for all
to authenticated
using ((select is_admin()));

-- ============================================================
-- TECHNICIANS — RLS
-- ============================================================

alter table technicians enable row level security;

-- Read-only for authenticated users (customer & admin)
drop policy if exists allow_read_technicians on technicians;
create policy allow_read_technicians
on technicians
for select
to authenticated
using (true);

-- Admin full access
drop policy if exists admin_all_technicians on technicians;
create policy admin_all_technicians
on technicians
for all
to authenticated
using ((select is_admin()));
