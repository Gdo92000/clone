import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });
  return { mockChain };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
  },
}));

vi.mock('../db/schema', () => ({ merchantOrders: {}, subscriptions: {}, plans: {}, branches: {}, users: {} }));

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
const planRow = { platform_fee_rate: '0.10', delivery_fee_per_order: '4.00' };
const orderRow = { total: '100.00', status: 'delivered', payment_method: 'credit_card', delivery_type: 'delivery' };

describe('merchant-finance route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: financeRoute } = await import('./merchant-finance');
    app = new Hono().route('/api/merchant-finance', financeRoute);
  });

  describe('GET /api/merchant-finance/summary', () => {
    it('returns finance summary for merchant', async () => {
      mockedDb.select
        .mockReturnValueOnce(mocks.mockChain([userRow]))
        .mockReturnValueOnce(mocks.mockChain([planRow]))
        .mockReturnValueOnce(mocks.mockChain([orderRow]));
      const res = await app.request('/api/merchant-finance/summary?year=2026&month=6');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.grossRevenue).toBe(100);
      expect(body.paidOrders).toBe(1);
    });

    it('returns empty summary when user not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/merchant-finance/summary?year=2026&month=6');
      expect(res.status).toBe(404);
    });
  });


});
