import { z } from "zod";

export const createTechnicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  photo_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

export const updateTechnicianSchema = createTechnicianSchema.partial();
