
create view service_log_customer_view as
select
  sl.id,
  sl.expected_id,
  sl.customer_product_id,

  sl.service_date,
  sl.service_type,
  sl.pekerjaan,

  sl.harga_service,               

  t.id   as technician_id,
  t.name as technician_name,
  t.photo_url as technician_photo,

  sl.job_evidence,
  sl.notes,
  sl.created_at
from service_log sl
join technicians t
  on t.id = sl.technician_id;

grant select on service_log_customer_view to authenticated;
