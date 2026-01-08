import { z } from "zod";

// Create Schema
export const createTechnicianSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z.string().optional().nullable(),
  photo_url: z.string().url("Invalid URL").optional().nullable().or(z.literal("")),
  notes: z.string().optional().nullable(),
});

// Update Schema (Partial)
export const updateTechnicianSchema = createTechnicianSchema.partial();

// TS Types inferred from Zod
export type CreateTechnicianDTO = z.infer<typeof createTechnicianSchema>;
export type UpdateTechnicianDTO = z.infer<typeof updateTechnicianSchema>;

// Response DTO
export interface TechnicianResponseDTO {
  id: string;
  name: string;
  phone: string | null;
  photo_url: string | null;
  notes: string | null;
  created_at: string | null;
}
