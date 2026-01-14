import dotenv from "dotenv";

dotenv.config();

export const config = {
  supabase: {
    url: process.env.SUPABASE_URL!,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    anonKey: process.env.SUPABASE_ANON_KEY!,
  },
  server: {
    port: process.env.PORT || 3001,
  },
};
