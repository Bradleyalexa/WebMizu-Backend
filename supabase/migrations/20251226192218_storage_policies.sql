
-- Read for everyone
create policy "public_read_technicians"
on storage.objects
for select
using (bucket_id = 'technicians');

-- Admin upload/update/delete
create policy "admin_manage_technicians"
on storage.objects
for all
using (
  bucket_id = 'technicians'
  and is_admin()
);

-- Customer read own product images
create policy "customer_read_own_products"
on storage.objects
for select
using (
  bucket_id = 'customer-products'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin full access
create policy "admin_manage_customer_products"
on storage.objects
for all
using (
  bucket_id = 'customer-products'
  and is_admin()
);

-- Customer read own service evidence
create policy "customer_read_own_service_evidence"
on storage.objects
for select
using (
  bucket_id = 'service-evidence'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin full access
create policy "admin_manage_service_evidence"
on storage.objects
for all
using (
  bucket_id = 'service-evidence'
  and is_admin()
);

-- Customer read own documents
create policy "customer_read_own_documents"
on storage.objects
for select
using (
  bucket_id = 'documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Admin full access
create policy "admin_manage_documents"
on storage.objects
for all
using (
  bucket_id = 'documents'
  and is_admin()
);
