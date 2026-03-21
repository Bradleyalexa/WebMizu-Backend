-- Updated RPC for searching customers joining profiles and addresses
create or replace function search_customers(search_text text)
returns table (
  id uuid,
  phone text,
  address_id uuid,
  address text,
  address_type address_type,
  status text,
  created_at timestamptz,
  profiles json
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.phone,
    c.address_id,
    a.cust_address as address,
    a.address_type,
    c.status::text,
    c.created_at,
    json_build_object('name', p.name, 'email', p.email) as profiles
  from customers c
  join profiles p on c.id = p.id
  left join addresses a on c.address_id = a.id
  where
    search_text is null or search_text = '' or
    c.phone ilike '%' || search_text || '%' or
    p.name ilike '%' || search_text || '%' or
    p.email ilike '%' || search_text || '%' or
    a.cust_address ilike '%' || search_text || '%';
$$;
