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

vi.mock('../db/schema', () => ({ merchantCoupons: {}, users: {}, branches: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: unknown) => void }).set('jwtPayload', { sub: 'merchant-1', role: 'merchant' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: unknown) => (c as { get: (k: string) => unknown }).get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const validCoupon = {
  branch_id: 'branch-1',
  code: 'PROMO10',
  discount_type: 'percentage',
  discount_value: '10',
  min_order: '0',
  max_uses: 100,
  valid_until: '2027-12-31T23:59:59.000Z',
};

const baseRow = {
  id: 'coupon-1',
  branch_id: 'branch-1',
  code: 'PROMO10',
  description: null,
  discount_type: 'percentage',
  discount_value: '10',
  min_order: '0',
  max_uses: 100,
  current_uses: 0,
  valid_until: new Date('2027-12-31'),
  is_active: true,
  created_at: new Date('2026-01-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: couponsRoute } = await import('./merchant-coupons');
  app = new Hono().route('/api/merchant-coupons', couponsRoute);
});

describe('GET /api/merchant-coupons', () => {
  it('returns all coupons for superadmin', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));
    const res = await app.request('/api/merchant-coupons');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it('returns 200 for merchant role', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));
    const res = await app.request('/api/merchant-coupons');
    expect(res.status).toBe(200);
  });
});

describe('GET /api/merchant-coupons/:id', () => {
  it('returns coupon by id', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/merchant-coupons/coupon-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('coupon-1');
  });

  it('returns 404 when coupon not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/merchant-coupons/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Not found');
  });
});

describe('POST /api/merchant-coupons', () => {
  it('creates a coupon successfully', async () => {
    const userRow = [{ id: 'merchant-1', role: 'merchant', branch_id: 'branch-1', company_id: 'company-1' }];
    mockedDb.select.mockReturnValue(mocks.mockChain(userRow));
    mockedDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/api/merchant-coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCoupon),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/api/merchant-coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/merchant-coupons/:id', () => {
  it('updates a coupon successfully', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/merchant-coupons/coupon-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'NEWCODE' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when coupon not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/merchant-coupons/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'NEWCODE' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/merchant-coupons/:id', () => {
  it('soft-deletes a coupon successfully', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/merchant-coupons/coupon-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when coupon not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/merchant-coupons/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
