import { z } from "zod";

export const createProductSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive").optional(),
  model: z.string().optional(),
  categoryId: z.string().uuid("Invalid category ID").optional(),
  imageUrl: z.string().url("Invalid image URL").optional(),
});

export const updateProductSchema = createProductSchema.partial();
