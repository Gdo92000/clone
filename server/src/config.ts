import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET é obrigatória'),
  CORS_ORIGINS: z.string().default('http://localhost:5173,https://localhost:5173,http://localhost:3000,https://localhost:3000,http://localhost:3001'),
  AUTH_PROVIDER: z.enum(['local', 'firebase']).default('local'),
  REDIS_URL: z.string().default(''),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  LOG_LEVEL: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal', 'silent']).default('debug'),
  PORT: z.coerce.number().int().positive().default(3001),
  MAX_BODY_SIZE: z.coerce.number().int().positive().default(1_000_000),
  LOGIN_MAX_ATTEMPTS: z.coerce.number().int().positive().default(5),
  LOGIN_LOCKOUT_MINUTES: z.coerce.number().int().positive().default(15),
});

export type EnvConfig = z.infer<typeof envSchema>;

function validateEnv(): EnvConfig {
  const isTest = process.env.NODE_ENV === 'test' || !process.env.NODE_ENV;
  if (isTest) {
    if (!process.env.DATABASE_URL) process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test';
    if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test-jwt-secret-for-testing-only';
  }
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const missing = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ');
    throw new Error(`Configuração inválida do ambiente:\n  ${missing}`);
  }
  return result.data;
}

const env = validateEnv();

export const JWT_SECRET = env.JWT_SECRET;
export const ALLOWED_ORIGINS = env.CORS_ORIGINS.split(',').map((s) => s.trim()).filter(Boolean);
export const AUTH_PROVIDER_TYPE = env.AUTH_PROVIDER;
export const REDIS_URL = env.REDIS_URL;
export const NODE_ENV = env.NODE_ENV;
export const LOG_LEVEL = env.LOG_LEVEL;
export const PORT = env.PORT;
export const MAX_BODY_SIZE = env.MAX_BODY_SIZE;
export const LOGIN_MAX_ATTEMPTS = env.LOGIN_MAX_ATTEMPTS;
export const LOGIN_LOCKOUT_MINUTES = env.LOGIN_LOCKOUT_MINUTES;

export function getJwtSecret(): string {
  return env.JWT_SECRET;
}
