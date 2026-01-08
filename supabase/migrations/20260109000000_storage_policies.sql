-- Enable RLS on storage.objects
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create Buckets if they don't exist
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('technicians', 'technicians', true),
  ('documents', 'documents', false),
  ('service-evidence', 'service-evidence', false),
  ('customer-product', 'customer-product', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- Clean up ALL old/conflicting/duplicate policies
-- We drop by name to be safe.
DROP POLICY IF EXISTS "admin_manage_customer_products" ON storage.objects;
DROP POLICY IF EXISTS "customer_read_own_products" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_documents" ON storage.objects;
DROP POLICY IF EXISTS "customer_read_own_documents" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_service_evidence" ON storage.objects;
DROP POLICY IF EXISTS "customer_read_own_service_evidence" ON storage.objects;
DROP POLICY IF EXISTS "admin_manage_technicians" ON storage.objects;
DROP POLICY IF EXISTS "public_read_technicians" ON storage.objects;

-- Drop previous bundled policies
DROP POLICY IF EXISTS "Admin All" ON storage.objects;
DROP POLICY IF EXISTS "Customer Select Own Data" ON storage.objects;
DROP POLICY IF EXISTS "Customer Select Technicians" ON storage.objects;


-- 1. Admin Policy (Global)
CREATE POLICY "Admin All" ON storage.objects
FOR ALL
TO authenticated
USING (
  exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' )
)
WITH CHECK (
  exists ( select 1 from public.profiles where id = auth.uid() and role = 'admin' )
);

-- 2. Customer Policies (Split for visibility)

-- Documents: Read Own
CREATE POLICY "Customer Select Documents" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND exists ( select 1 from public.profiles where id = auth.uid() and role = 'customer' )
);

-- Service Evidence: Read Own
CREATE POLICY "Customer Select Evidence" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'service-evidence' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND exists ( select 1 from public.profiles where id = auth.uid() and role = 'customer' )
);

-- Customer Product: Read Own
CREATE POLICY "Customer Select Product" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-product' 
  AND (storage.foldername(name))[1] = auth.uid()::text
  AND exists ( select 1 from public.profiles where id = auth.uid() and role = 'customer' )
);

-- Technicians: Read All
CREATE POLICY "Customer Select Technicians" ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'technicians'
  AND exists ( select 1 from public.profiles where id = auth.uid() and role = 'customer' )
);
