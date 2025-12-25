-- 1. Drop view lama (hapus SECURITY DEFINER secara total)
DROP VIEW IF EXISTS public.service_log_customer_view;

-- 2. Recreate view sebagai SECURITY INVOKER (default)
CREATE VIEW public.service_log_customer_view AS
SELECT
  sl.id,
  sl.expected_id,
  sl.customer_product_id,
  sl.technician_id,
  sl.service_date,
  sl.service_type,
  sl.pekerjaan,
  sl.harga_service,
  -- ❌ teknisi_fee sengaja tidak disertakan
  sl.job_evidence,
  sl.notes,
  sl.created_at
FROM service_log sl;

-- 3. Grant akses ke authenticated (customer & admin)
GRANT SELECT ON public.service_log_customer_view TO authenticated;
