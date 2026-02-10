import { z } from "zod";

export const createScheduleSchema = z.object({
  customer_product_id: z.string().uuid(),
  contract_id: z.string().uuid().optional(),
  job_id: z.string().uuid().optional(),
  expected_date: z.string().datetime(), // ISO string
  status: z.enum(["pending", "done", "canceled"]).default("pending"),
  notes: z.string().optional(),
});

export const updateScheduleSchema = createScheduleSchema.partial();

export const scheduleQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  status: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional(),
  customerProductId: z.string().optional(),
});

export type CreateScheduleDTO = z.infer<typeof createScheduleSchema>;
export type UpdateScheduleDTO = z.infer<typeof updateScheduleSchema>;
export type ScheduleQueryDTO = z.infer<typeof scheduleQuerySchema>;
