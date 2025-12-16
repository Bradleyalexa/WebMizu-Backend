-- =====================================================
-- FIX RLS auth.uid() PERFORMANCE
-- =====================================================

-- PROFILES
drop policy if exists customer_select_own_profile on profiles;
drop policy if exists customer_update_own_profile on profiles;

create policy customer_select_own_profile
on profiles
for select
to authenticated
using (id = (select auth.uid()));

create policy customer_update_own_profile
on profiles
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- CUSTOMERS
drop policy if exists customer_select_own on customers;
drop policy if exists customer_update_own on customers;

create policy customer_select_own
on customers
for select
to authenticated
using (id = (select auth.uid()));

create policy customer_update_own
on customers
for update
to authenticated
using (id = (select auth.uid()))
with check (id = (select auth.uid()));

-- CUSTOMER PRODUCTS
drop policy if exists customer_select_own_products on customer_products;

create policy customer_select_own_products
on customer_products
for select
to authenticated
using (customer_id = (select auth.uid()));

-- CONTRACTS
drop policy if exists customer_select_own_contracts on contracts;

create policy customer_select_own_contracts
on contracts
for select
to authenticated
using (
  customer_product_id in (
    select id
    from customer_products
    where customer_id = (select auth.uid())
  )
);

-- ORDERS
drop policy if exists customer_select_own_orders on orders;
drop policy if exists customer_insert_own_orders on orders;

create policy customer_select_own_orders
on orders
for select
to authenticated
using (customer_id = (select auth.uid()));

create policy customer_insert_own_orders
on orders
for insert
to authenticated
with check (customer_id = (select auth.uid()));

-- INVOICES
drop policy if exists customer_select_own_invoices on invoices;

create policy customer_select_own_invoices
on invoices
for select
to authenticated
using (customer_id = (select auth.uid()));

-- CHAT
drop policy if exists customer_select_own_chat on chat_messages;
drop policy if exists customer_send_chat on chat_messages;

create policy customer_select_own_chat
on chat_messages
for select
to authenticated
using (customer_id = (select auth.uid()));

create policy customer_send_chat
on chat_messages
for insert
to authenticated
with check (
  customer_id = (select auth.uid())
  and sender_role = 'customer'
);

-- NOTIFICATIONS
drop policy if exists user_select_own_notifications on notifications;
drop policy if exists user_update_own_notifications on notifications;

create policy user_select_own_notifications
on notifications
for select
to authenticated
using (user_id = (select auth.uid()));

create policy user_update_own_notifications
on notifications
for update
to authenticated
using (user_id = (select auth.uid()))
with check (user_id = (select auth.uid()));

-- ORDER PRODUCT
drop policy if exists customer_select_own_order_product on order_product;

create policy customer_select_own_order_product
on order_product
for select
to authenticated
using (
  order_id in (
    select id
    from orders
    where customer_id = (select auth.uid())
  )
);
