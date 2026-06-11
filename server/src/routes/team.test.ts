import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });
  return { mockChain };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({ users: {}, branches: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'admin', company_id: 'company-1' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../services/auditLogService', () => ({
  createAuditLog: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

vi.mock('../auth', () => ({
  getAuthProvider: () => ({
    hashPassword: vi.fn().mockResolvedValue('hashed-password'),
  }),
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const baseUserRow = {
  id: 'user-1',
  name: 'João Silva',
  email: 'joao@exemplo.com',
  phone: null,
  role: 'merchant',
  sub_role: 'attendant',
  is_active: true,
  company_id: 'company-1',
  branch_id: 'branch-1',
  avatar_url: null,
  password_hash: 'hash',
  created_at: new Date('2026-01-01'),
  updated_at: new Date('2026-01-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: teamRoute } = await import('./team');
  app = new Hono().route('/api/team', teamRoute);
});

describe('GET /api/team', () => {
  it('returns list of team members', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));
    const res = await app.request('/api/team');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });
});

describe('GET /api/team/:id', () => {
  it('returns a team member by id', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));
    const res = await app.request('/api/team/user-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.name).toBe('João Silva');
    expect(body.password_hash).toBeUndefined();
  });

  it('returns 404 when user not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));
    const res = await app.request('/api/team/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/team/invite', () => {
  const inviteBody = {
    name: 'Maria Souza',
    email: 'maria@exemplo.com',
    role: 'attendant',
    branch_id: 'branch-1',
  };

  it('invites a team member successfully', async () => {
    const chain = mocks.mockChain([]);
    const branchChain = mocks.mockChain([{ company_id: 'company-1' }]);
    mockedDb.select
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(branchChain);

    const res = await app.request('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteBody),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 409 when email already exists', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));

    const res = await app.request('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(inviteBody),
    });
    expect(res.status).toBe(409);
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/team/:id', () => {
  it('updates a team member successfully', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));

    const res = await app.request('/api/team/user-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'João Atualizado' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when user not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/team/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teste' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/team/:id/deactivate', () => {
  it('deactivates a team member', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));

    const res = await app.request('/api/team/user-1/deactivate', { method: 'PATCH' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when user not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/team/nonexistent/deactivate', { method: 'PATCH' });
    expect(res.status).toBe(404);
  });
});

describe('PATCH /api/team/:id/reactivate', () => {
  it('reactivates a team member', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseUserRow]));

    const res = await app.request('/api/team/user-1/reactivate', { method: 'PATCH' });
    expect(res.status).toBe(200);
  });

  it('returns 404 when user not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/team/nonexistent/reactivate', { method: 'PATCH' });
    expect(res.status).toBe(404);
  });
});
