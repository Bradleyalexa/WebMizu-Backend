import { Database } from "../../../../../../packages/types/supabase";

type CustomerStatus = Database['public']['Enums']['customer_status'];
type AddressType = Database['public']['Enums']['address_type'];

export interface Customer {
  id: string;
  name: string;
  email: string; // Added email
  phone?: string;
  address?: string;
  addressType?: "apartment" | "rumah" | "company";
  status: "active" | "inactive" | "blacklisted";
  createdAt: string;
  updatedAt?: string;
}
