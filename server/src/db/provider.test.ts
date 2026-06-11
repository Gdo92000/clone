import { describe, it, expect } from 'vitest';
import type { EnvConfig } from '../config';

const baseEnv: EnvConfig = {
  JWT_SECRET: 'test-secret',
  VAPID_PUBLIC_KEY: 'test-key',
  VAPID_PRIVATE_KEY: 'test-key',
  CORS_ORIGINS: 'http://localhost:5173',
  AUTH_PROVIDER: 'local',
  REDIS_URL: '',
  NODE_ENV: 'development',
  LOG_LEVEL: 'debug',
  PORT: 3001,
  MAX_BODY_SIZE: 1_000_000,
  LOGIN_MAX_ATTEMPTS: 5,
  LOGIN_LOCKOUT_MINUTES: 15,
  VAPID_SUBJECT: 'mailto:dev@fluxdelivery.com',
};

describe('resolveDbProvider', () => {
  it('returns memory when NODE_ENV is test', async () => {
    const { resolveDbProvider } = await import('./provider');
    expect(resolveDbProvider({ ...baseEnv, NODE_ENV: 'test' })).toBe('memory');
  });

  it('returns memory when DATABASE_URL is __memory__', async () => {
    const { resolveDbProvider } = await import('./provider');
    expect(resolveDbProvider({ ...baseEnv, NODE_ENV: 'development', DATABASE_URL: '__memory__' })).toBe('memory');
  });

  it('returns postgres for production', async () => {
    const { resolveDbProvider } = await import('./provider');
    expect(resolveDbProvider({ ...baseEnv, NODE_ENV: 'production', DATABASE_URL: 'postgres://localhost' })).toBe('postgres');
  });

  it('CAPABILITIES has correct keys', async () => {
    const { CAPABILITIES } = await import('./provider');
    expect(CAPABILITIES.postgres.hasTelemetry).toBe(true);
    expect(CAPABILITIES.memory.hasSnapshot).toBe(true);
  });
});
