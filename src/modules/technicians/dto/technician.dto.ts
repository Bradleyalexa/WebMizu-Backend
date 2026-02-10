import { z } from "zod";
import { createTechnicianSchema, updateTechnicianSchema } from "../schemas/technician.schema";

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
