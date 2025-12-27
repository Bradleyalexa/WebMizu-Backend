create table jobs (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  default_price numeric(12,2) check (default_price is null or default_price >= 0),
  created_at timestamptz default now()
);

alter table service_log
add column job_id uuid references jobs(id);

alter table schedule_expected
add column job_id uuid references jobs(id);

alter table jobs enable row level security;

-- Admin: full access
create policy "admin_all_jobs"
on jobs
for all
to authenticated
using ((select is_admin()));

-- Customer: read-only (for display, pricing reference)
create policy "customer_read_jobs"
on jobs
for select
to authenticated
using (true);