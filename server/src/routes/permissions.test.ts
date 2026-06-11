import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, deleteMock, mockAuthMiddleware } = vi.hoisted(() => {
  return {
    selectMock: vi.fn(),
    insertMock: vi.fn(),
    deleteMock: vi.fn(),
    mockAuthMiddleware: vi.fn(),
  };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: deleteMock,
  },
}));

vi.mock('../db/schema', () => ({
  permissions: { id: 'id', key: 'key', name: 'name', description: 'description', created_at: 'created_at' },
  rolePermissions: { role: 'role', permission_id: 'permission_id' },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: mockAuthMiddleware,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c, next) => { await next(); }) as MiddlewareHandler,
}));

function makeChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function makeLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({
      then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)),
    }),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

describe('permissions route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all permissions', async () => {
    selectMock.mockImplementation(() => makeChain([{ id: '1', key: 'create_order', name: 'Create Order' }]));
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
  });

  it('GET /role/:role returns permissions for role', async () => {
    selectMock.mockImplementation(() => makeChain([{ permission_id: '1', name: 'Create Order' }]));
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions/role/admin');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
  });

  it('POST /assign creates a new role permission', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role: 'admin', permissionId: '1' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalled();
  });

  it('POST /assign returns 400 for missing fields', async () => {
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions/assign', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /revoke/:role/:permissionId removes a permission', async () => {
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions/revoke/admin/1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('returns 401 without auth', async () => {
    mockAuthMiddleware.mockImplementationOnce(() => {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    });
    const { default: route } = await import('./permissions');
    const app = new Hono().route('/api/permissions', route);
    const res = await app.request('/api/permissions');
    expect(res.status).toBe(401);
  });
});
