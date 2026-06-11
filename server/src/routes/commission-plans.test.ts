import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, mockAuthMiddleware } = vi.hoisted(() => {
  return { selectMock: vi.fn(), insertMock: vi.fn(), updateMock: vi.fn(), mockAuthMiddleware: vi.fn() };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
  },
}));

vi.mock('../db/schema', () => ({
  commissionPlans: {
    plan_id: 'plan_id', marketplace_fee: 'marketplace_fee', delivery_fee: 'delivery_fee',
    payment_fee: 'payment_fee', additional_fees: [], updated_at: 'updated_at',
  },
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
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function makeLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({
      then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)),
    }),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

describe('commission-plans route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns existing commission plans', async () => {
    selectMock.mockImplementation(() => makeChain([
      { plan_id: 'basic', marketplace_fee: '12', delivery_fee: '8', payment_fee: '3.5', additional_fees: [] },
      { plan_id: 'pro', marketplace_fee: '8', delivery_fee: '5', payment_fee: '2.5', additional_fees: [] },
    ]));
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(2);
  }, 15000);

  it('GET / seeds default plans when empty', async () => {
    const firstCall = makeChain([]);
    const secondCall = makeChain([
      { plan_id: 'basic', marketplace_fee: '12', delivery_fee: '8', payment_fee: '3.5', additional_fees: [] },
      { plan_id: 'pro', marketplace_fee: '8', delivery_fee: '5', payment_fee: '2.5', additional_fees: [] },
      { plan_id: 'premium', marketplace_fee: '5', delivery_fee: '3', payment_fee: '1.5', additional_fees: [] },
    ]);
    selectMock.mockImplementationOnce(() => firstCall);
    selectMock.mockImplementationOnce(() => secondCall);
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans');
    expect(res.status).toBe(200);
    const body = await res.json() as { plan_id: string }[];
    expect(body).toHaveLength(3);
    expect(insertMock).toHaveBeenCalled();
  });

  it('PUT /:id updates an existing plan', async () => {
    selectMock.mockImplementation(() => makeLimitChain([
      { plan_id: 'pro', marketplace_fee: '8', delivery_fee: '5', payment_fee: '2.5', additional_fees: [] },
    ]));
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans/pro', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace_fee: '6' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(updateMock).toHaveBeenCalled();
  });

  it('PUT /:id inserts a new plan when not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans/premium', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace_fee: '5', delivery_fee: '3' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(insertMock).toHaveBeenCalled();
  });

  it('PUT /:id returns 400 for invalid plan id', async () => {
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans/invalid', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace_fee: '5' }),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id returns 400 for invalid fee format', async () => {
    selectMock.mockImplementation(() => makeLimitChain([
      { plan_id: 'basic', marketplace_fee: '12', delivery_fee: '8', payment_fee: '3.5', additional_fees: [] },
    ]));
    const { default: route } = await import('./commission-plans');
    const app = new Hono().route('/api/commission-plans', route);
    const res = await app.request('/api/commission-plans/basic', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ marketplace_fee: 'abc' }),
    });
    expect(res.status).toBe(400);
  });
});
