import { z } from "zod";

export const createJobSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  default_price: z.number().min(0).optional().default(0),
});

export const updateJobSchema = createJobSchema.partial();

export const jobQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
});
