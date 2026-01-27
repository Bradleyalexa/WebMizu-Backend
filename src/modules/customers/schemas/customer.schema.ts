import { z } from "zod";

// Enums from Supabase types
export const CustomerStatusEnum = z.enum(["active", "inactive", "blacklisted"]);
export const AddressTypeEnum = z.enum(["apartment", "rumah", "company"]);

export const createCustomerSchema = z.object({
  name: z.string().min(2, "Name is required (min 2 chars)"),
  phone: z.string().min(8, "Phone number is required").regex(/^\+?[0-9\s-]*$/, "Invalid phone format"),
  address: z.string().min(5, "Address is required"),
  addressType: AddressTypeEnum.optional().default("rumah"),
  status: CustomerStatusEnum.optional().default("active"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6).optional(), // Admin can set it, or we generate one
});

export const updateCustomerSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().min(8).regex(/^\+?[0-9\s-]*$/).optional(),
  address: z.string().min(5).optional(),
  addressType: AddressTypeEnum.optional(),
  status: CustomerStatusEnum.optional(),
});

export const customerQuerySchema = z.object({
  page: z.string().optional(),
  limit: z.string().optional(),
  search: z.string().optional(),
  addressType: AddressTypeEnum.optional(),
});
