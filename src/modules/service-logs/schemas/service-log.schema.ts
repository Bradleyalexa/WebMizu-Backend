import { z } from "zod";

export const createServiceLogSchema = z.object({
  customer_product_id: z.string().uuid("Check Product ID").min(1, "Product is required"),
  technician_id: z.string().uuid("Check Technician ID").min(1, "Technician is required"),
  service_date: z.string().or(z.date()), // Accepts ISO string or Date object
  service_type: z.enum(["contract", "perpanggil"]).default("perpanggil"),
  pekerjaan: z.string().min(1, "Job description (Pekerjaan) is required"),
  notes: z.string().optional(),
  harga_service: z.number().min(0).optional().default(0),
  teknisi_fee: z.number().min(0).optional().default(0),
  job_evidence: z.array(z.string()).optional(), // Array of URLs
  expected_id: z.string().uuid().optional().or(z.literal("")), // Allow empty string or UUID
  job_id: z.string().uuid().optional().or(z.literal("")),
});

export const updateServiceLogSchema = createServiceLogSchema.partial();
