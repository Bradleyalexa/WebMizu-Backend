alter table customer_products
add column quantity_owned int not null default 1
check (quantity_owned > 0);

create type customer_status as enum ('active','inactive','blacklisted');

alter table customers
add column status customer_status default 'active';
