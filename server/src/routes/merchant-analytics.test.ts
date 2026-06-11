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

vi.mock('../db/schema', () => ({ merchantOrders: {}, branches: {}, users: {} }));

vi.mock('../middleware/auth', () => ({
  getTokenPayload: (c: { get: (k: string) => unknown }) => c.get('jwtPayload'),
}));

vi.mock('../lib/tenant', () => ({
  tenantIsolationMiddleware: () => (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'user-1', role: 'merchant' });
    c.set('tenantId', 'company-1');
    await next();
  }) as MiddlewareHandler,
}));

import { db } from '../db';

const mockedDb = vi.mocked(db);

const userRow = { company_id: 'company-1', branch_id: 'branch-1' };
const orderRow = { total: '100.00', status: 'delivered', created_at: new Date().toISOString() };

describe('merchant-analytics route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: analyticsRoute } = await import('./merchant-analytics');
    app = new Hono().route('/api/merchant-analytics', analyticsRoute);
  });

  describe('GET /api/merchant-analytics/dashboard', () => {
    it('returns dashboard for merchant', async () => {
      mockedDb.select
        .mockReturnValueOnce(mocks.mockChain([userRow]))
        .mockReturnValueOnce(mocks.mockChain([orderRow]));
      const res = await app.request('/api/merchant-analytics/dashboard?days=30');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.revenue).toBe(100);
      expect(body.orderCount).toBe(1);
    });

    it('returns empty dashboard when user not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/merchant-analytics/dashboard?days=30');
      expect(res.status).toBe(404);
    });
  });
});
