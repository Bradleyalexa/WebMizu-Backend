-- Enable RLS
alter table product_catalog enable row level security;

-- Public read (catalog visible for landing page)
drop policy if exists allow_read_product_catalog on product_catalog;
create policy allow_read_product_catalog
on product_catalog
for select
to anon, authenticated
using (true);

-- Admin full access
drop policy if exists admin_all_product_catalog on product_catalog;
create policy admin_all_product_catalog
on product_catalog
for all
to authenticated
using ((select is_admin()));
