import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  PORT: z.string(),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(10),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(10),

  SUPABASE_STORAGE_BUCKET_PUBLIC: z.string(),
  SUPABASE_STORAGE_BUCKET_PRIVATE: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (!_env.success) {
  console.error('❌ Invalid environment variables')
  console.error(_env.error.format())
  process.exit(1)
}

export const env = {
  NODE_ENV: _env.data.NODE_ENV,
  PORT: Number(_env.data.PORT),

  SUPABASE_URL: _env.data.SUPABASE_URL,
  SUPABASE_ANON_KEY: _env.data.SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: _env.data.SUPABASE_SERVICE_ROLE_KEY,

  STORAGE: {
    PUBLIC: _env.data.SUPABASE_STORAGE_BUCKET_PUBLIC,
    PRIVATE: _env.data.SUPABASE_STORAGE_BUCKET_PRIVATE,
  },
}
