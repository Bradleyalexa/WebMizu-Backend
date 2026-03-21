-- Simple RPC that returns just customer IDs matching a search text
-- Used by the backend to do cross-table OR filtering without PostgREST limitations
create or replace function search_customer_ids(search_text text)
returns table (id uuid)
language sql
stable
security definer
set search_path = public
as $$
  select distinct c.id
  from customers c
  join profiles p on c.id = p.id
  where
    search_text is null or search_text = '' or
    c.phone ilike '%' || search_text || '%' or
    p.name ilike '%' || search_text || '%' or
    p.email ilike '%' || search_text || '%';
$$;
