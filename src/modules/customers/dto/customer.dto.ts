import { z } from "zod";
import {
  createCustomerSchema,
  updateCustomerSchema,
  customerQuerySchema,
} from "../schemas/customer.schema";

export type CreateCustomerDTO = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryDTO = z.infer<typeof customerQuerySchema>;
