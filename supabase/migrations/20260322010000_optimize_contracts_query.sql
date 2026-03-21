-- ============================================================
-- OPTIMIZE CONTRACTS QUERY PERFORMANCE
-- ============================================================

-- Add composite index for the most common query pattern:
-- filtering by status and ordering by created_at DESC
create index if not exists idx_contracts_status_created_at on contracts(status, created_at desc);

-- Add index on contract status alone for status-only filters
create index if not exists idx_contracts_status on contracts(status);

-- Add index on created_at for date-based queries
create index if not exists idx_contracts_created_at on contracts(created_at desc);

-- Add index on schedule_expected contract_id for faster joins
create index if not exists idx_schedule_expected_contract_id on schedule_expected(contract_id);

-- Add index on customer_products.product_catalog_id for faster product lookups
create index if not exists idx_customer_products_product_catalog_id on customer_products(product_catalog_id);

-- Add composite index for customer_products joins
create index if not exists idx_customer_products_customer_product on customer_products(customer_id, product_catalog_id);
