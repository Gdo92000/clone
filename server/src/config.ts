import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL é obrigatória quando DATABASE_PROVIDER=postgres').optional(),
  DATABASE_PROVIDER: z.enum(['postgres', 'memory']).optional(),
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
    // Validação customizada: DATABASE_URL é opcional se DATABASE_PROVIDER=memory
    const invalid = result.error.issues
      .filter(issue => issue.path[0] !== 'DATABASE_URL');
    if (invalid.length === 0 && process.env.DATABASE_PROVIDER === 'memory') {
      return {
        DATABASE_URL: '',
        DATABASE_PROVIDER: 'memory',
        JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret',
        CORS_ORIGINS: process.env.CORS_ORIGINS ?? 'http://localhost:5173',
        AUTH_PROVIDER: process.env.AUTH_PROVIDER as 'local' | 'firebase' ?? 'local',
        REDIS_URL: process.env.REDIS_URL ?? '',
        NODE_ENV: process.env.NODE_ENV as 'development' | 'production' | 'test' ?? 'development',
        LOG_LEVEL: process.env.LOG_LEVEL as 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal' | 'silent' ?? 'debug',
        PORT: parseInt(process.env.PORT ?? '3001', 10),
        MAX_BODY_SIZE: parseInt(process.env.MAX_BODY_SIZE ?? '1000000', 10),
        LOGIN_MAX_ATTEMPTS: parseInt(process.env.LOGIN_MAX_ATTEMPTS ?? '5', 10),
        LOGIN_LOCKOUT_MINUTES: parseInt(process.env.LOGIN_LOCKOUT_MINUTES ?? '15', 10),
      };
    }
    const missing = result.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('\n  ');
    throw new Error(`Configuração inválida do ambiente:\n  ${missing}`);
  }
  return result.data;
}

export const env = validateEnv();

export const JWT_SECRET = env.JWT_SECRET;
export const DATABASE_PROVIDER = env.DATABASE_PROVIDER ?? null;
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
