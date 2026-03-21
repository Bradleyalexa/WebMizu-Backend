import { Database } from "@packages/types/supabase";

type CustomerStatus = Database["public"]["Enums"]["customer_status"];
type AddressType = Database["public"]["Enums"]["address_type"];

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  addressId?: string; // New field
  address?: string; // Legacy/Joined field
  addressType?: "apartment" | "rumah" | "company"; // Legacy/Joined field
  addresses?: {
    id: string;
    custAddress: string;
    addressType: "apartment" | "rumah" | "company";
    isPrimary: boolean;
  }[];
  status: "active" | "inactive" | "blacklisted";
  createdAt: string;
  updatedAt?: string;
}
