import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config/config";
import { Database } from "../../../../packages/types/supabase";

// Singleton admin client (Service Role) - Bypasses RLS
// usage: Repositories (for admin logic), Background Jobs
export const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  config.supabase.url,
  config.supabase.serviceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

// Factory for User Context Client (Anon Key + JWT) - Enforces RLS
// usage: Repositories (for customer logic)
export const createSupabaseClient = (accessToken: string): SupabaseClient<Database> => {
  if (!accessToken) {
      throw new Error("Access token required for user context client");
  }

  return createClient<Database>(
    config.supabase.url,
    config.supabase.anonKey, // Uses Safe Anon Key
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`, // Injects User JWT
        },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
};
