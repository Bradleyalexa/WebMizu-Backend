-- Add email column
alter table public.profiles add column if not exists email text;

-- Update trigger function
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, role, name, email)
  values (
    new.id,
    'customer',
    coalesce(new.raw_user_meta_data ->> 'name', 'New User'),
    new.email
  );

  insert into public.customers (id)
  values (new.id);

  return new;
end;
$$;

-- Backfill data
update public.profiles
set email = auth.users.email
from auth.users
where public.profiles.id = auth.users.id;
