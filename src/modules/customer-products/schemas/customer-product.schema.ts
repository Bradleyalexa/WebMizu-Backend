import { z } from "zod";

export const createCustomerProductSchema = z.object({
  customer_id: z.string().uuid(),
  product_catalog_id: z.string().uuid(),
  installation_technician_id: z.string().uuid().optional(),
  installation_date: z.string().date().optional(), // YYYY-MM-DD
  installation_location: z.string().optional(),
  cust_product_price: z.coerce.number().optional(),
  quantity_owned: z.number().int().default(1),
  status: z.enum(['active', 'inactive', 'tradeIn']).default('active'),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  notes: z.string().optional(),
});

export const updateCustomerProductSchema = createCustomerProductSchema.partial();
