import { z } from "zod";

export const createTaskSchema = z.object({
  task_date: z.string().datetime(), // timestamptz requires ISO datetime
  customer_id: z.string().uuid().optional(),
  customer_product_id: z.string().uuid().optional(),
  expected_id: z.string().uuid().optional(),
  technician_id: z.string().uuid().optional(),
  job_id: z.string().uuid({ message: "Job is required" }), 
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  task_type: z.enum(["general", "service"]).optional().default("general"),
  status: z.enum(["pending", "completed", "canceled"]).default("pending"),
});

export const updateTaskSchema = createTaskSchema.partial();

export const taskQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  status: z.string().optional(),
  technicianId: z.string().optional(),
  customerProductId: z.string().optional(),
  date: z.string().optional(),
});
