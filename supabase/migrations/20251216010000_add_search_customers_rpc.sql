-- RPC for searching customers with joining profiles
create or replace function search_customers(search_text text)
returns table (
  id uuid,
  phone text,
  address text,
  address_type address_type,
  status text, -- Cast to text to match return type flexibility
  created_at timestamptz,
  profiles json -- json object matching the select structure
)
language sql
security definer
set search_path = public
as $$
  select
    c.id,
    c.phone,
    c.address,
    c.address_type,
    c.status::text,
    c.created_at,
    json_build_object('name', p.name, 'email', p.email) as profiles
  from customers c
  join profiles p on c.id = p.id
  where
    search_text is null or search_text = '' or
    c.phone ilike '%' || search_text || '%' or
    p.name ilike '%' || search_text || '%' or
    p.email ilike '%' || search_text || '%';
$$;
