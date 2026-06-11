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
    transaction: vi.fn(),
  },
}));

vi.mock('../db/schema', () => ({ loyaltySettings: {}, userLoyaltyPoints: {}, loyaltyRewards: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'user-1', role: 'customer' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: { get: (k: string) => unknown }) => c.get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('userCompanyId', 'company-1');
    c.set('userBranchId', 'branch-1');
    await next();
  }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const settingsRow = { branch_id: 'branch-1', enabled: true, points_per_real: '1.00', created_at: new Date(), updated_at: null };
const pointsRow = { user_id: 'user-1', branch_id: 'branch-1', points_balance: 100, created_at: new Date(), updated_at: null };
const rewardRow = { id: 'reward-1', branch_id: 'branch-1', name: 'Desconto 10%', points_required: 50, discount_value: '10.00', discount_type: 'percentage', is_active: true, created_at: new Date() };

function makeTx(rewardResult: unknown[], pointsResult: unknown[]) {
  const txSelect = vi.fn()
    .mockReturnValueOnce(mocks.mockChain(rewardResult))
    .mockReturnValueOnce(mocks.mockChain(pointsResult));
  return {
    select: txSelect,
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
  };
}

describe('loyalty route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: loyaltyRoute } = await import('./loyalty');
    app = new Hono().route('/api/loyalty', loyaltyRoute);
  });

  describe('GET /api/loyalty/me/loyalty', () => {
    it('returns loyalty info when enabled', async () => {
      mockedDb.select
        .mockReturnValueOnce(mocks.mockChain([pointsRow]))
        .mockReturnValueOnce(mocks.mockChain([settingsRow]))
        .mockReturnValueOnce(mocks.mockChain([rewardRow]));
      const res = await app.request('/api/loyalty/me/loyalty?branch_id=branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.balance).toBe(100);
    });

    it('returns 400 without branch_id', async () => {
      const res = await app.request('/api/loyalty/me/loyalty');
      expect(res.status).toBe(400);
    });

    it('returns 404 when loyalty disabled', async () => {
      mockedDb.select
        .mockReturnValueOnce(mocks.mockChain([pointsRow]))
        .mockReturnValueOnce(mocks.mockChain([{ ...settingsRow, enabled: false }]));
      const res = await app.request('/api/loyalty/me/loyalty?branch_id=branch-1');
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/loyalty/me/loyalty/redeem', () => {
    it('redeems reward successfully', async () => {
      mockedDb.transaction.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<Response>) => {
        return cb(makeTx([rewardRow], [pointsRow]));
      });
      const res = await app.request('/api/loyalty/me/loyalty/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: 'reward-1', branchId: 'branch-1' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when reward not found', async () => {
      mockedDb.transaction.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<Response>) => {
        return cb(makeTx([], [pointsRow]));
      });
      const res = await app.request('/api/loyalty/me/loyalty/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: 'invalid', branchId: 'branch-1' }),
      });
      expect(res.status).toBe(404);
    });

    it('returns 400 when insufficient points', async () => {
      mockedDb.transaction.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<Response>) => {
        return cb(makeTx([{ ...rewardRow, points_required: 500 }], [pointsRow]));
      });
      const res = await app.request('/api/loyalty/me/loyalty/redeem', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: 'reward-1', branchId: 'branch-1' }),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('GET /api/loyalty/settings/:branchId', () => {
    it('returns settings when found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([settingsRow]));
      const res = await app.request('/api/loyalty/settings/branch-1');
      expect(res.status).toBe(200);
    });

    it('returns default when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/loyalty/settings/branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.enabled).toBe(false);
    });
  });

  describe('PUT /api/loyalty/settings/:branchId', () => {
    it('updates existing settings', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([settingsRow]));
      const res = await app.request('/api/loyalty/settings/branch-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });
      expect(res.status).toBe(200);
    });

    it('inserts when settings not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/loyalty/settings/branch-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: true, points_per_real: '2.00' }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/loyalty/rewards/:branchId', () => {
    it('returns rewards list', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([rewardRow]));
      const res = await app.request('/api/loyalty/rewards/branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });
  });

  describe('POST /api/loyalty/rewards', () => {
    it('creates reward', async () => {
      const res = await app.request('/api/loyalty/rewards', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ branch_id: 'branch-1', name: 'Desconto', points_required: 50, discount_value: '10.00', discount_type: 'percentage' }),
      });
      expect(res.status).toBe(201);
    });
  });

  describe('PUT /api/loyalty/rewards/:id', () => {
    it('updates reward', async () => {
      const res = await app.request('/api/loyalty/rewards/reward-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Desconto 20%', points_required: 100 }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('DELETE /api/loyalty/rewards/:id', () => {
    it('deletes reward', async () => {
      const res = await app.request('/api/loyalty/rewards/reward-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });
  });
});
