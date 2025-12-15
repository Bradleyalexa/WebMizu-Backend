alter table profiles enable row level security;
alter table customers enable row level security;
alter table customer_products enable row level security;
alter table contracts enable row level security;
alter table schedule_expected enable row level security;
alter table service_log enable row level security;
alter table orders enable row level security;
alter table order_product enable row level security;
alter table invoices enable row level security;
alter table tasks enable row level security;
alter table chat_messages enable row level security;
alter table notifications enable row level security;

create or replace function is_admin()
returns boolean
language sql
stable
security definer
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

create policy "customer_select_own_profile"
on profiles
for select
to authenticated
using (id = auth.uid());

create policy "customer_update_own_profile"
on profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "admin_all_profiles"
on profiles
for all
to authenticated
using ((select is_admin()));

-- Admin: full access
create policy "admin_all_customers"
on customers
for all
to authenticated
using ((select is_admin()));

-- Customer: can only view their own data
create policy "customer_select_own"
on customers
for select
to authenticated
using (id = auth.uid());

-- Customer: can update their own data
create policy "customer_update_own"
on customers
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

-- Admin: full access
create policy "admin_all_customer_products"
on customer_products
for all
to authenticated
using ((select is_admin()));

-- Customer: can only view their own products
create policy "customer_select_own_products"
on customer_products
for select
to authenticated
using (customer_id = auth.uid());

-- Admin: full access
create policy "admin_all_contracts"
on contracts
for all
to authenticated
using ((select is_admin()));

-- Customer: can only view contracts for their products
create policy "customer_select_own_contracts"
on contracts
for select
to authenticated
using (
  customer_product_id in (
    select id
    from customer_products
    where customer_id = auth.uid()
  )
);

-- Admin: full access
create policy "admin_all_schedules"
on schedule_expected
for all
to authenticated
using ((select is_admin()));

-- Admin: full access
create policy "admin_all_service_logs"
on service_log
for all
to authenticated
using ((select is_admin()));

-- Allow public read
create policy "allow_read_product_catalog"
on product_catalog
for select
to authenticated, anon
using (true);

-- Admin full access
create policy "admin_all_product_catalog"
on product_catalog
for all
to authenticated
using ((select is_admin()));

-- Admin: full access
create policy "admin_all_orders"
on orders
for all
to authenticated
using ((select is_admin()));

-- Customer: can view and create their own orders
create policy "customer_select_own_orders"
on orders
for select
to authenticated
using (customer_id = auth.uid());

create policy "customer_insert_own_orders"
on orders
for insert
to authenticated
with check (customer_id = auth.uid());

create policy "admin_all_invoices"
on invoices
for all
to authenticated
using ((select is_admin()));

-- Customer: can only view their own invoices
create policy "customer_select_own_invoices"
on invoices
for select
to authenticated
using (customer_id = auth.uid());

-- Admin: full access
create policy "admin_all_tasks"
on tasks
for all
to authenticated
using ((select is_admin()));

-- Admin: full access
create policy "admin_all_chat"
on chat_messages
for all
to authenticated
using ((select is_admin()));

-- Customer: can view their own chat messages
create policy "customer_select_own_chat"
on chat_messages
for select
to authenticated
using (customer_id = auth.uid());

-- Customer: can send chat messages (as customer role)
create policy "customer_send_chat"
on chat_messages
for insert
to authenticated
with check (
  customer_id = auth.uid()
  and sender_role = 'customer'
);

-- Admin: full access
create policy "admin_all_notifications"
on notifications
for all
to authenticated
using ((select is_admin()));

-- User (admin or customer): can view their own notifications
create policy "user_select_own_notifications"
on notifications
for select
to authenticated
using (user_id = auth.uid());

-- User: can mark their notifications as read
create policy "user_update_own_notifications"
on notifications
for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());


create policy "admin_all_order_product"
on order_product
for all
to authenticated
using ((select is_admin()));

create policy "customer_select_own_order_product"
on order_product
for select
to authenticated
using (
  order_id in (
    select id
    from orders
    where customer_id = auth.uid()
  )
);

grant select on service_log_customer_view to authenticated;
