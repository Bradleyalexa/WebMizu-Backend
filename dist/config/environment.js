"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
// Environment validation schema
const envSchema = zod_1.z.object({
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().transform(Number).default('3001'),
    SUPABASE_URL: zod_1.z.string().min(1, 'Supabase URL is required'),
    SUPABASE_ANON_KEY: zod_1.z.string().min(1, 'Supabase anon key is required'),
    SUPABASE_SERVICE_KEY: zod_1.z.string().min(1, 'Supabase service key is required'),
    JWT_SECRET: zod_1.z.string().min(32, 'JWT secret must be at least 32 characters'),
    JWT_EXPIRES_IN: zod_1.z.string().default('24h'),
    CORS_ORIGINS: zod_1.z.string().default('http://localhost:3000,http://localhost:3001'),
    UPLOAD_MAX_SIZE: zod_1.z.string().transform(Number).default('10485760'), // 10MB
    UPLOAD_ALLOWED_TYPES: zod_1.z.string().default('image/jpeg,image/png,image/gif,application/pdf')
});
// Parse and validate environment variables
const env = envSchema.parse(process.env);
exports.config = {
    nodeEnv: env.NODE_ENV,
    port: env.PORT,
    supabase: {
        url: env.SUPABASE_URL,
        anonKey: env.SUPABASE_ANON_KEY,
        serviceKey: env.SUPABASE_SERVICE_KEY,
    },
    jwt: {
        secret: env.JWT_SECRET,
        expiresIn: env.JWT_EXPIRES_IN,
    },
    corsOrigins: env.CORS_ORIGINS.split(','),
    upload: {
        maxSize: env.UPLOAD_MAX_SIZE,
        allowedTypes: env.UPLOAD_ALLOWED_TYPES.split(','),
    }
};
//# sourceMappingURL=environment.js.map