import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';

const dbSelectMock = vi.fn();
const dbInsertMock = vi.fn();
const dbUpdateMock = vi.fn();
const dbTransactionMock = vi.fn();
const bcryptHashMock = vi.fn();
const bcryptCompareMock = vi.fn();
const jwtSignMock = vi.fn();
const jwtVerifyMock = vi.fn().mockResolvedValue({ sub: 'user-1', role: 'merchant' });

vi.mock('../db', () => ({
  db: {
    select: dbSelectMock,
    insert: dbInsertMock,
    update: dbUpdateMock,
    transaction: dbTransactionMock,
  },
}));

vi.mock('../db/schema', () => ({
  users: { id: 'id', email: 'email' },
  authSessions: { id: 'id' },
  passwordResets: { id: 'id' },
}));

vi.mock('../config', () => ({
  getJwtSecret: () => 'test-jwt-secret',
  JWT_SECRET: 'test-jwt-secret',
  VAPID_PUBLIC_KEY: 'test-key',
  NODE_ENV: 'test',
  LOG_LEVEL: 'silent',
}));

vi.mock('bcryptjs', () => ({
  default: {
    hash: bcryptHashMock,
    compare: bcryptCompareMock,
  },
}));

vi.mock('hono/jwt', () => ({
  sign: jwtSignMock,
  verify: jwtVerifyMock,
  jwt: () => (async (c: { req: { header: (s: string) => string | undefined }; set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    const authHeader = c.req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new Error('No token');
    }
    c.set('jwtPayload', { sub: 'user-1', email: 'user@test.com', role: 'merchant', company_id: 'company-1' });
    await next();
  }) as unknown as MiddlewareHandler,
}));

vi.mock('../services/sse', () => ({ publish: vi.fn() }));
vi.mock('../services/push', () => ({ sendPush: vi.fn(), getVapidPublicKey: () => 'key' }));
vi.mock('../services/auditLogService', () => ({ createAuditLog: vi.fn() }));
vi.mock('../middleware/rateLimit', () => ({ rateLimit: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as unknown as MiddlewareHandler }));
vi.mock('../lib/cookieConfig', () => ({ REFRESH_COOKIE_NAME: 'refresh_token', REFRESH_COOKIE_OPTIONS: {} }));

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: authRoutes } = await import('./auth');
  app = new Hono().route('/api/auth', authRoutes);
});

describe('POST /api/auth/register', () => {
  beforeEach(() => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });
    dbInsertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    dbTransactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
      await cb({ insert: dbInsertMock });
    });
    bcryptHashMock.mockResolvedValue('hashed-password');
  });

  it('registers a new user and returns 201', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'João', email: 'joao@test.com', password: '123456' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });

  it('returns 409 when email already exists', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'existing' }]),
    });
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Maria', email: 'existing@test.com', password: '123456' }),
    });
    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid input', async () => {
    const res = await app.request('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: '', email: 'not-email', password: '12' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(() => {
    bcryptCompareMock.mockResolvedValue(true);
    jwtSignMock.mockResolvedValue('access-token');
  });

  it('returns tokens on successful login', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: 'user-1', name: 'João', email: 'joao@test.com', role: 'merchant',
        sub_role: null, avatar_url: null, is_active: true, company_id: 'c1', branch_id: null,
        password_hash: '$2a$10$hash',
      }]),
    });
    dbInsertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joao@test.com', password: '123456' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { token: string; user: { email: string } };
    expect(body.token).toBe('access-token');
    expect(body.user.email).toBe('joao@test.com');
  });

  it('returns 401 on wrong password', async () => {
    bcryptCompareMock.mockResolvedValue(false);
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: 'user-1', name: 'João', email: 'joao@test.com', role: 'merchant',
        sub_role: null, avatar_url: null, is_active: true, company_id: 'c1', branch_id: null,
        password_hash: '$2a$10$hash',
      }]),
    });

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'joao@test.com', password: 'wrong' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 401 for unknown email', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'unknown@test.com', password: '123456' }),
    });
    expect(res.status).toBe(401);
  });

  it('returns 400 for invalid input', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: '', password: '' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/forgot-password', () => {
  beforeEach(() => {
    dbInsertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    dbTransactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
      await cb({ insert: dbInsertMock });
    });
  });

  it('returns success even when email does not exist', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nonexistent@test.com' }),
    });
    expect(res.status).toBe(200);
  });

  it('inserts password reset token when email exists', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'user-1' }]),
    });
    const res = await app.request('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'user@test.com' }),
    });
    expect(res.status).toBe(200);
    expect(dbTransactionMock).toHaveBeenCalled();
  });
});

describe('POST /api/auth/logout', () => {
  it('clears cookie and returns success', async () => {
    dbUpdateMock.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
    });
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const res = await app.request('/api/auth/logout', {
      method: 'POST',
      headers: { Authorization: 'Bearer valid-token' },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as { success: boolean };
    expect(body.success).toBe(true);
  });
});

describe('GET /api/auth/me', () => {
  it('returns user data when authenticated', async () => {
    dbSelectMock.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{
        id: 'user-1', name: 'João', email: 'joao@test.com', role: 'merchant',
        sub_role: null, avatar_url: null, is_active: true, company_id: 'c1', branch_id: null,
      }]),
    });
    const res = await app.request('/api/auth/me', {
      headers: { Authorization: 'Bearer valid-token' },
    });
    expect(res.status).toBe(200);
  });

  it('returns 401 without auth header', async () => {
    const res = await app.request('/api/auth/me');
    expect(res.status).toBe(401);
  });
});
