-- Force drop to clear old metadata
drop view if exists public.service_log_customer_view cascade;

-- Recreate as plain view (SECURITY INVOKER by default)
create view public.service_log_customer_view as
select
  sl.id,
  sl.expected_id,
  sl.customer_product_id,
  sl.technician_id,
  sl.service_date,
  sl.service_type,
  sl.pekerjaan,
  sl.harga_service,
  sl.job_evidence,
  sl.notes,
  sl.created_at
from service_log sl;

grant select on public.service_log_customer_view to authenticated;
