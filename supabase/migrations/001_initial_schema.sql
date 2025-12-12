-- WebMizu System Database Schema
-- Based on the provided ERD with 15 tables

-- Create ENUM types
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE address_type AS ENUM ('apartment', 'rumah', 'company');
CREATE TYPE product_status AS ENUM ('active', 'inactive', 'tradeIn');
CREATE TYPE service_type AS ENUM ('contract', 'perpanggil');
CREATE TYPE schedule_status AS ENUM ('pending', 'done', 'canceled');
CREATE TYPE contract_status AS ENUM ('active', 'expired');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'cancelled');
CREATE TYPE task_status AS ENUM ('pending', 'completed', 'canceled');
CREATE TYPE sender_type AS ENUM ('customer', 'admin');
CREATE TYPE notification_type AS ENUM ('service', 'contract', 'invoice', 'order', 'chat', 'system');
CREATE TYPE entity_type AS ENUM ('schedule', 'contract', 'invoice', 'order', 'service_log', 'chat', 'other');

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. profiles table - User profiles with auth integration
CREATE TABLE profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    name TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. customers table - Customer information
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID UNIQUE NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    phone TEXT NOT NULL,
    address TEXT,
    address_type address_type DEFAULT 'rumah',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. product_category table
CREATE TABLE product_category (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. product_catalog table
CREATE TABLE product_catalog (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES product_category(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    model TEXT,
    description TEXT,
    price NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. technicians table
CREATE TABLE technicians (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    photo_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. orders table
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    order_date DATE NOT NULL DEFAULT NOW(),
    status order_status DEFAULT 'pending',
    total_amount NUMERIC(12,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. order_product table
CREATE TABLE order_product (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_catalog_id UUID NOT NULL REFERENCES product_catalog(id),
    qty INTEGER NOT NULL DEFAULT 1,
    price NUMERIC(12,2) NOT NULL,
    subtotal NUMERIC(12,2) GENERATED ALWAYS AS (qty * price) STORED,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. customer_products table
CREATE TABLE customer_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    product_catalog_id UUID NOT NULL REFERENCES product_catalog(id),
    order_product_id UUID REFERENCES order_product(id),
    installation_technician_id UUID REFERENCES technicians(id),
    photo_url TEXT,
    installation_location TEXT NOT NULL,
    installation_date DATE NOT NULL,
    notes TEXT,
    status product_status DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 9. contracts table
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_product_id UUID NOT NULL REFERENCES customer_products(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    interval_months INTEGER NOT NULL,
    total_service INTEGER NOT NULL,
    services_used INTEGER DEFAULT 0,
    status contract_status DEFAULT 'active',
    contract_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT unique_active_contract UNIQUE (customer_product_id, status)
    DEFERRABLE INITIALLY DEFERRED
);

-- 10. schedule_expected table
CREATE TABLE schedule_expected (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_product_id UUID NOT NULL REFERENCES customer_products(id) ON DELETE CASCADE,
    contract_id UUID REFERENCES contracts(id) ON DELETE CASCADE,
    expected_date DATE NOT NULL,
    interval_months INTEGER,
    source_type TEXT NOT NULL DEFAULT 'contract',
    status schedule_status DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. service_log table
CREATE TABLE service_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    expected_id UUID REFERENCES schedule_expected(id) ON DELETE SET NULL,
    customer_product_id UUID NOT NULL REFERENCES customer_products(id) ON DELETE CASCADE,
    technician_id UUID NOT NULL REFERENCES technicians(id),
    service_date DATE NOT NULL DEFAULT NOW(),
    service_type service_type NOT NULL,
    pekerjaan TEXT NOT NULL,
    harga_service INTEGER DEFAULT 0,
    teknisi_fee NUMERIC(12,2),
    job_evidence JSONB DEFAULT '[]',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 12. invoices table
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    related_type TEXT NOT NULL,
    related_id UUID,
    invoice_number TEXT UNIQUE NOT NULL,
    total_amount NUMERIC(12,2) NOT NULL,
    pdf_url TEXT,
    status invoice_status DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 13. tasks table
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_date DATE NOT NULL,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    customer_product_id UUID REFERENCES customer_products(id) ON DELETE SET NULL,
    expected_id UUID REFERENCES schedule_expected(id) ON DELETE SET NULL,
    technician_id UUID REFERENCES technicians(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    status task_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 14. chat_messages table
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    sender_type sender_type NOT NULL,
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 15. notification table
CREATE TABLE notification (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL,
    entity_type entity_type,
    entity_id UUID,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_customers_profile_id ON customers(profile_id);
CREATE INDEX idx_customer_products_customer_id ON customer_products(customer_id);
CREATE INDEX idx_customer_products_product_catalog_id ON customer_products(product_catalog_id);
CREATE INDEX idx_contracts_customer_product_id ON contracts(customer_product_id);
CREATE INDEX idx_schedule_expected_customer_product_id ON schedule_expected(customer_product_id);
CREATE INDEX idx_schedule_expected_contract_id ON schedule_expected(contract_id);
CREATE INDEX idx_service_log_customer_product_id ON service_log(customer_product_id);
CREATE INDEX idx_service_log_technician_id ON service_log(technician_id);
CREATE INDEX idx_orders_customer_id ON orders(customer_id);
CREATE INDEX idx_order_product_order_id ON order_product(order_id);
CREATE INDEX idx_order_product_product_catalog_id ON order_product(product_catalog_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_tasks_customer_product_id ON tasks(customer_product_id);
CREATE INDEX idx_tasks_technician_id ON tasks(technician_id);
CREATE INDEX idx_chat_messages_customer_id ON chat_messages(customer_id);
CREATE INDEX idx_notification_user_id ON notification(user_id);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION trigger_set_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to tables that have it
CREATE TRIGGER set_timestamp_profiles
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_customers
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_product_catalog
    BEFORE UPDATE ON product_catalog
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_technicians
    BEFORE UPDATE ON technicians
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_customer_products
    BEFORE UPDATE ON customer_products
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_orders
    BEFORE UPDATE ON orders
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_contracts
    BEFORE UPDATE ON contracts
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_schedule_expected
    BEFORE UPDATE ON schedule_expected
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_service_log
    BEFORE UPDATE ON service_log
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_invoices
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

CREATE TRIGGER set_timestamp_tasks
    BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE PROCEDURE trigger_set_timestamp();

-- Row Level Security (RLS) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE schedule_expected ENABLE ROW LEVEL SECURITY;
ALTER TABLE service_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_product ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification ENABLE ROW LEVEL SECURITY;

-- Profiles RLS policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles" ON profiles
    FOR SELECT USING (auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Customers RLS policies
CREATE POLICY "Customers can view own data" ON customers
    FOR SELECT USING (profile_id = auth.uid());

CREATE POLICY "Admins full access to customers" ON customers
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Customer Products RLS policies
CREATE POLICY "Customers can view own products" ON customer_products
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins full access to customer_products" ON customer_products
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Contracts RLS policies
CREATE POLICY "Customers can view own contracts" ON contracts
    FOR SELECT USING (
        customer_product_id IN (
            SELECT id FROM customer_products
            WHERE customer_id IN (
                SELECT id FROM customers WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins full access to contracts" ON contracts
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Schedule Expected RLS policies
CREATE POLICY "Customers can view own schedules" ON schedule_expected
    FOR SELECT USING (
        customer_product_id IN (
            SELECT id FROM customer_products
            WHERE customer_id IN (
                SELECT id FROM customers WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins full access to schedules" ON schedule_expected
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Service Log RLS policies
CREATE POLICY "Customers can view own service logs" ON service_log
    FOR SELECT USING (
        customer_product_id IN (
            SELECT id FROM customer_products
            WHERE customer_id IN (
                SELECT id FROM customers WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins full access to service_logs" ON service_log
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Orders RLS policies
CREATE POLICY "Customers can view own orders" ON orders
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins full access to orders" ON orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Order Product RLS policies
CREATE POLICY "Customers can view own order products" ON order_product
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM orders
            WHERE customer_id IN (
                SELECT id FROM customers WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins full access to order_product" ON order_product
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Invoices RLS policies
CREATE POLICY "Customers can view own invoices" ON invoices
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Admins full access to invoices" ON invoices
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Tasks RLS policies
CREATE POLICY "Customers can view own tasks" ON tasks
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        ) OR
        customer_product_id IN (
            SELECT id FROM customer_products
            WHERE customer_id IN (
                SELECT id FROM customers WHERE profile_id = auth.uid()
            )
        )
    );

CREATE POLICY "Admins full access to tasks" ON tasks
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Chat Messages RLS policies
CREATE POLICY "Customers can view own chat messages" ON chat_messages
    FOR SELECT USING (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        )
    );

CREATE POLICY "Customers can send chat messages" ON chat_messages
    FOR INSERT WITH CHECK (
        customer_id IN (
            SELECT id FROM customers WHERE profile_id = auth.uid()
        ) AND
        sender_type = 'customer'
    );

CREATE POLICY "Admins full access to chat_messages" ON chat_messages
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Notification RLS policies
CREATE POLICY "Users can view own notifications" ON notification
    FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can update own notifications" ON notification
    FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Admins full access to notifications" ON notification
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Grant access to tables
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON customers TO authenticated;
GRANT ALL ON product_category TO authenticated;
GRANT ALL ON product_catalog TO authenticated;
GRANT ALL ON technicians TO authenticated;
GRANT ALL ON orders TO authenticated;
GRANT ALL ON order_product TO authenticated;
GRANT ALL ON customer_products TO authenticated;
GRANT ALL ON contracts TO authenticated;
GRANT ALL ON schedule_expected TO authenticated;
GRANT ALL ON service_log TO authenticated;
GRANT ALL ON invoices TO authenticated;
GRANT ALL ON tasks TO authenticated;
GRANT ALL ON chat_messages TO authenticated;
GRANT ALL ON notification TO authenticated;

-- Grant access to service role for backend operations
GRANT ALL ON profiles TO service_role;
GRANT ALL ON customers TO service_role;
GRANT ALL ON product_category TO service_role;
GRANT ALL ON product_catalog TO service_role;
GRANT ALL ON technicians TO service_role;
GRANT ALL ON orders TO service_role;
GRANT ALL ON order_product TO service_role;
GRANT ALL ON customer_products TO service_role;
GRANT ALL ON contracts TO service_role;
GRANT ALL ON schedule_expected TO service_role;
GRANT ALL ON service_log TO service_role;
GRANT ALL ON invoices TO service_role;
GRANT ALL ON tasks TO service_role;
GRANT ALL ON chat_messages TO service_role;
GRANT ALL ON notification TO service_role;