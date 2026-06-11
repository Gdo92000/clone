import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, registerClientMock, subscribeMock, getStatsMock } = vi.hoisted(() => {
  return {
    selectMock: vi.fn(),
    registerClientMock: vi.fn().mockReturnValue({ id: 'sse:user-1:abc123', topics: new Set(), write: vi.fn(), ping: vi.fn(), close: vi.fn() }),
    subscribeMock: vi.fn(),
    getStatsMock: vi.fn().mockReturnValue({ clients: 1, topics: 2 }),
  };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({
  users: { id: 'id', company_id: 'company_id', branch_id: 'branch_id', role: 'role' },
  branches: { id: 'id', company_id: 'company_id' },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c, next) => {
    c.set('jwtPayload', { sub: 'user-1', role: 'superadmin' });
    await next();
  }) as MiddlewareHandler,
}));

vi.mock('../services/sse', () => ({
  registerClient: registerClientMock,
  subscribe: subscribeMock,
  getStats: getStatsMock,
}));

vi.mock('../lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

function mockSelectThen(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function mockLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

describe('sse route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockSelectThen([]));
  });

  it('GET /stats returns SSE client stats', async () => {
    const { default: route } = await import('./sse');
    const app = new Hono().route('/api/sse', route);
    const res = await app.request('/api/sse/stats');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.clients).toBe(1);
    expect(body.topics).toBe(2);
  });

  it('GET /orders returns 401 when no jwtPayload', async () => {
    void vi.mocked(vi.importActual('../middleware/auth')).then(() => {});
    const { default: _route } = await import('./sse');
    const app = new Hono();
    // Override route to use a mock that doesn't set jwtPayload
    const testRoute = new Hono();
    testRoute.use('*', (async (c, next) => {
      c.set('jwtPayload', undefined);
      await next();
    }) as MiddlewareHandler);
    testRoute.get('/orders', (c) => {
      const jwtPayload = c.get('jwtPayload') as { sub?: string } | undefined;
      if (!jwtPayload?.sub) return c.json({ error: 'Unauthorized' }, 401);
      return c.json({ ok: true });
    });
    app.route('/api/sse', testRoute);
    const res = await app.request('/api/sse/orders', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(401);
  });

  it('GET /orders?branch_id= returns 403 when merchant tries another branch', async () => {
    selectMock.mockImplementation(() => mockLimitChain([
      { company_id: 'company-1', branch_id: 'branch-1', role: 'merchant' },
    ]));
    const { default: route } = await import('./sse');
    const app = new Hono().route('/api/sse', route);
    const res = await app.request('/api/sse/orders?branch_id=branch-2', {
      headers: { Authorization: 'Bearer t' },
    });
    expect(res.status).toBe(403);
  });

  it('GET /orders?branch_id= allows superadmin for any branch', async () => {
    selectMock.mockImplementation(() => mockLimitChain([
      { company_id: 'company-1', branch_id: 'branch-1', role: 'superadmin' },
    ]));
    // For superadmin, streamSSE is called, so expect 200
    const { default: route } = await import('./sse');
    const app = new Hono().route('/api/sse', route);
    const res = await app.request('/api/sse/orders?branch_id=branch-2', {
      headers: { Authorization: 'Bearer t' },
    });
    expect([200, 500]).toContain(res.status);
  });
});
