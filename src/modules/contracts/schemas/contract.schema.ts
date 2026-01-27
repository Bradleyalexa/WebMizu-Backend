import { z } from 'zod';

export const createContractSchema = z.object({
  customer_product_id: z.string().uuid(),
  start_date: z.string(),
  end_date: z.string(),
  interval_months: z.number().int().positive(),
  total_service: z.number().int().positive(),
  contract_url: z.string().optional(),
  notes: z.string().optional(),
  price: z.number().min(0).optional(),
});

export const updateContractSchema = createContractSchema.partial().extend({
  services_used: z.number().int().min(0).optional(),
  status: z.enum(['active', 'expired']).optional(),
});

export const contractQuerySchema = z.object({
  status: z.enum(['active', 'expired', 'all']).optional(),
  productName: z.string().optional(),
});
