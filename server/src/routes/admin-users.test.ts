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
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
  },
}));

vi.mock('../db/schema', () => ({ users: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'admin-1', role: 'superadmin' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: { get: (k: string) => unknown }) => c.get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const userRow = { id: 'user-1', name: 'João', email: 'joao@teste.com', phone: '11999999999', role: 'merchant', is_active: true, company_id: null, branch_id: null, password_hash: 'hash123', created_at: new Date(), updated_at: null };

describe('admin-users route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: adminUsersRoute } = await import('./admin-users');
    app = new Hono().route('/api/admin/users', adminUsersRoute);
  });

  describe('GET /api/admin/users', () => {
    it('returns all users without password_hash', async () => {
      const base = { ...userRow };
      const response = { id: 'user-1', name: 'João', email: 'joao@teste.com', phone: '11999999999', role: 'merchant', is_active: true, company_id: null, branch_id: null, created_at: base.created_at };
      mockedDb.select.mockReturnValue(mocks.mockChain([response]));
      const res = await app.request('/api/admin/users');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>[];
      expect(body).toHaveLength(1);
      expect(body[0]).not.toHaveProperty('password_hash');
    });
  });

  describe('GET /api/admin/users/:id', () => {
    it('returns user without password_hash', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([userRow]));
      const res = await app.request('/api/admin/users/user-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.name).toBe('João');
      expect(body).not.toHaveProperty('password_hash');
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/admin/users/invalid');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/admin/users/:id', () => {
    it('updates user', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([userRow]));
      const res = await app.request('/api/admin/users/user-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'João Atualizado' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/admin/users/invalid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Teste' }),
      });
      expect(res.status).toBe(404);
    });
  });
});
