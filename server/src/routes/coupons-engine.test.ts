import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const createChain = (result: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((resolve: (v: unknown) => void) => { resolve(result); }),
  });
  return { createChain };
});

const dbSelectMock = vi.hoisted(() => vi.fn(() => mocks.createChain([])));

vi.mock('../db', () => ({
  db: { select: dbSelectMock },
}));

vi.mock('../db/schema', () => ({
  merchantCoupons: {
    id: 'id', branch_id: 'branch_id', code: 'code',
    discount_type: 'discount_type', discount_value: 'discount_value',
    min_order: 'min_order', max_uses: 'max_uses', current_uses: 'current_uses',
    valid_until: 'valid_until', is_active: 'is_active', rules: 'rules',
  },
  orders: { user_id: 'user_id', restaurant_id: 'restaurant_id' },
}));

const getTokenPayloadMock = vi.hoisted(() => vi.fn(() => ({ sub: 'user-1', role: 'consumer' })));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: getTokenPayloadMock,
}));

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: couponsRoute } = await import('./coupons-engine');
  app = new Hono().route('/api/coupons', couponsRoute);
});

describe('POST /api/coupons/validate', () => {
  const validBody = { code: 'PROMO10', branchId: 'branch-1', orderTotal: '5000' };

  const validCoupon = {
    id: 'coupon-1',
    branch_id: 'branch-1',
    code: 'PROMO10',
    discount_type: 'percentage',
    discount_value: '10',
    min_order: '0',
    max_uses: null,
    current_uses: 0,
    valid_until: new Date(Date.now() + 86400000).toISOString(),
    is_active: true,
    rules: null,
  };

  it('returns 200 and discount for valid percentage coupon', async () => {
    dbSelectMock.mockReturnValueOnce(mocks.createChain([validCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.discount).toBe(500);
    expect(body.newTotal).toBe(4500);
    expect(body.couponName).toBe('PROMO10');
  });

  it('returns 200 with fixed discount when discount_type is fixed', async () => {
    const fixedCoupon = { ...validCoupon, discount_type: 'fixed', discount_value: '500' };
    dbSelectMock.mockReturnValueOnce(mocks.createChain([fixedCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.discount).toBe(500);
    expect(body.newTotal).toBe(4500);
  });

  it('returns 404 for invalid coupon code', async () => {
    dbSelectMock.mockReturnValueOnce(mocks.createChain([]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Cupom inválido para esta loja');
  });

  it('returns 400 for inactive coupon', async () => {
    const inactiveCoupon = { ...validCoupon, is_active: false };
    dbSelectMock.mockReturnValueOnce(mocks.createChain([inactiveCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Este cupom não está mais ativo');
  });

  it('returns 400 for expired coupon', async () => {
    const expiredCoupon = { ...validCoupon, valid_until: new Date(Date.now() - 86400000).toISOString() };
    dbSelectMock.mockReturnValueOnce(mocks.createChain([expiredCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Este cupom expirou');
  });

  it('returns 400 when max uses reached', async () => {
    const limitCoupon = { ...validCoupon, max_uses: 5, current_uses: 5 };
    dbSelectMock.mockReturnValueOnce(mocks.createChain([limitCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Limite de usos atingido');
  });

  it('returns 400 when order total is below minimum', async () => {
    const minOrderCoupon = { ...validCoupon, min_order: '100' };
    dbSelectMock.mockReturnValueOnce(mocks.createChain([minOrderCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validBody, orderTotal: '50' }),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toContain('Valor mínimo do pedido');
  });

  it('returns 400 when first_order_only rule is active and user has previous orders', async () => {
    const firstOrderCoupon = { ...validCoupon, rules: { first_order_only: true } };
    dbSelectMock
      .mockReturnValueOnce(mocks.createChain([firstOrderCoupon]))
      .mockReturnValueOnce(mocks.createChain([{ id: 'order-1' }]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(400);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Este cupom é válido apenas para o primeiro pedido');
  });

  it('returns 200 for first-order coupon when user has no previous orders', async () => {
    const firstOrderCoupon = { ...validCoupon, rules: { first_order_only: true } };
    dbSelectMock
      .mockReturnValueOnce(mocks.createChain([firstOrderCoupon]))
      .mockReturnValueOnce(mocks.createChain([]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 401 when not authenticated', async () => {
    getTokenPayloadMock.mockReturnValueOnce(null);
    dbSelectMock.mockReturnValueOnce(mocks.createChain([validCoupon]));
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(401);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Não autenticado');
  });

  it('returns 400 for invalid request body', async () => {
    const res = await app.request('/api/coupons/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'PROMO10' }),
    });
    expect(res.status).toBe(400);
  });
});
