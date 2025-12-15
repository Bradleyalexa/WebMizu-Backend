-- ============================================================
-- INIT SCHEMA — WEBMIZU (FINAL)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type user_role as enum ('admin', 'customer');
create type address_type as enum ('apartment','rumah','company');
create type product_status as enum ('active','inactive','tradeIn');
create type contract_status as enum ('active','expired');
create type schedule_status as enum ('pending','done','canceled');
create type service_type as enum ('contract','perpanggil');
create type invoice_related_type as enum ('order','contract','service','other');
create type order_status as enum ('pending','paid','cancelled');
create type invoice_status as enum ('draft','sent','paid','cancelled');
create type task_status as enum ('pending','completed','canceled');
create type notification_type as enum (
  'service_reminder',
  'invoice_created',
  'payment_received',
  'contract_expiring',
  'contract_activated',
  'service_completed',
  'general'
);

-- ============================================================
-- PROFILES (AUTH MIRROR)
-- ============================================================
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  name text not null,
  created_at timestamptz default now()
);

-- ============================================================
-- CUSTOMERS
-- ============================================================
create table customers (
  id uuid primary key references profiles(id),
  phone text unique,
  address text,
  address_type address_type,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCT CATEGORY
-- ============================================================
create table product_category (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  created_at timestamptz default now()
);

-- ============================================================
-- PRODUCT CATALOG
-- ============================================================
create table product_catalog (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references product_category(id),
  name text not null,
  model text not null,
  description text,
  price numeric(12,2) not null check (price >= 0),
  created_at timestamptz default now()
);

-- ============================================================
-- TECHNICIANS
-- ============================================================
create table technicians (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  phone text,
  photo_url text,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  order_date date not null,
  status order_status default 'pending',
  total_amount numeric(12,2) not null check (total_amount >= 0),
  created_at timestamptz default now()
);

-- ============================================================
-- ORDER PRODUCT
-- ============================================================
create table order_product (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_catalog_id uuid not null references product_catalog(id),
  qty int not null check (qty > 0),
  price int not null check (price >= 0),
  subtotal int not null check (subtotal >= 0)
);

-- ============================================================
-- CUSTOMER PRODUCTS (INSTALLED UNITS)
-- ============================================================
create table customer_products (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  product_catalog_id uuid not null references product_catalog(id),
  order_product_id uuid references order_product(id),
  installation_technician_id uuid references technicians(id),
  installation_location text not null,
  installation_date date not null,
  photo_url text,
  notes text,
  status product_status default 'active',
  created_at timestamptz default now()
);

-- ============================================================
-- CONTRACTS
-- ============================================================
create table contracts (
  id uuid primary key default gen_random_uuid(),
  customer_product_id uuid not null references customer_products(id),
  start_date date not null,
  end_date date not null,
  interval_months int not null,
  total_service int not null,
  services_used int default 0,
  status contract_status default 'active',
  contract_url text,
  notes text,
  created_at timestamptz default now(),

  constraint contract_date_check check (end_date >= start_date),
  constraint contract_interval_check check (interval_months > 0),
  constraint contract_total_service_check check (total_service > 0),
  constraint contract_services_used_check check (
    services_used >= 0 and services_used <= total_service
  )
);

-- ============================================================
-- SCHEDULE EXPECTED
-- ============================================================
create table schedule_expected (
  id uuid primary key default gen_random_uuid(),
  customer_product_id uuid not null references customer_products(id),
  contract_id uuid references contracts(id),
  expected_date date not null,
  interval_months int not null check (interval_months > 0),
  source_type service_type not null,
  status schedule_status default 'pending',
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- SERVICE LOG
-- ============================================================
create table service_log (
  id uuid primary key default gen_random_uuid(),
  expected_id uuid references schedule_expected(id),
  customer_product_id uuid not null references customer_products(id),
  technician_id uuid not null references technicians(id),
  service_date date not null,
  service_type service_type not null,
  pekerjaan text not null,
  harga_service int not null check (harga_service >= 0),
  teknisi_fee numeric(12,2) check (teknisi_fee is null or teknisi_fee >= 0),
  job_evidence jsonb,
  notes text,
  created_at timestamptz default now()
);

-- ============================================================
-- INVOICES
-- ============================================================
create sequence invoice_number_seq;
create table invoices (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  related_type invoice_related_type not null,
  related_id uuid,
  invoice_number text unique not null
  default (
    'INV-' || to_char(now(), 'YYYYMM') || '-' || lpad(nextval('invoice_number_seq')::text, 6, '0')
  ),
  total_amount int not null check (total_amount >= 0),
  pdf_url text,
  status invoice_status default 'draft',
  created_at timestamptz default now()
);

-- ============================================================
-- TASKS
-- ============================================================
create table tasks (
  id uuid primary key default gen_random_uuid(),
  task_date date not null,
  customer_id uuid references customers(id),
  customer_product_id uuid references customer_products(id),
  expected_id uuid references schedule_expected(id),
  technician_id uuid references technicians(id),
  task_type text,
  title text not null,
  description text,
  status task_status default 'pending',
  created_at timestamptz default now()
);

-- ============================================================
-- CHAT MESSAGES
-- ============================================================
create table chat_messages (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references customers(id),
  sender_role user_role not null,
  message text not null,
  attachments jsonb,
  created_at timestamptz default now()
);

-- ============================================================
-- NOTIFICATIONS
-- ============================================================
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id),
  type notification_type not null,
  payload jsonb not null,
  is_read boolean default false,
  created_at timestamptz default now()
);

-- ============================================================
-- CUSTOMER SAFE VIEW (NO teknisi_fee)
-- ============================================================
create or replace view service_log_customer_view as
select
  sl.id,
  sl.expected_id,
  sl.customer_product_id,
  sl.technician_id,
  t.name as technician_name,
  t.photo_url as technician_photo,
  sl.service_date,
  sl.service_type,
  sl.pekerjaan,
  sl.harga_service,
  sl.job_evidence,
  sl.notes,
  sl.created_at
from service_log sl
join technicians t on t.id = sl.technician_id;

-- ============================================================
-- INDEXES
-- ============================================================
create index idx_customer_products_customer_id on customer_products(customer_id);
create index idx_contracts_customer_product_id on contracts(customer_product_id);
create index idx_schedule_expected_date on schedule_expected(expected_date);
create index idx_service_log_customer_product on service_log(customer_product_id);
create index idx_orders_customer_id on orders(customer_id);
create index idx_invoices_customer_id on invoices(customer_id);
create index idx_notifications_user_unread on notifications(user_id, is_read);

-- ============================================================
-- AUTH TRIGGER
-- ============================================================
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'name', 'New User')
  );

  insert into public.customers (id)
  values (new.id);

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row
execute procedure public.handle_new_user();
