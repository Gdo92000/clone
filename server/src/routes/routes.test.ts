import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, deleteMock, transactionMock } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();
  const transaction = vi.fn();
  return { selectMock: select, insertMock: insert, updateMock: update, deleteMock: del, transactionMock: transaction };
});

vi.mock('../db', () => {
  const mockChain = (result: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  });

  return {
    db: {
      select: selectMock.mockReturnValue(mockChain([])),
      insert: insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      update: updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
      delete: deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
      transaction: transactionMock,
    },
  };
});

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'admin-1', email: 'admin@test.com', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

function mockSelect(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function mockSelectWithLimit(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

type BodyRecord = Record<string, unknown>;

const resetDbMocks = () => {
  selectMock.mockReset();
  selectMock.mockImplementation(() => mockSelect([]));
  insertMock.mockReset();
  insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
  updateMock.mockReset();
  updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  deleteMock.mockReset();
  deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  transactionMock.mockReset();
  transactionMock.mockRejectedValue(new Error('transaction not mocked for this test'));
};

describe('Route integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  describe('Plans', () => {
    it('GET / returns empty array when no plans', async () => {
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans');
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord[];
      expect(Array.isArray(body)).toBe(true);
    }, 10000);

    it('GET / returns plans from DB', async () => {
      selectMock.mockImplementation(() => mockSelect([{ id: 'basic', name: 'Básico', monthly_price: '29.90', is_active: true }]));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans');
      const body = await res.json() as BodyRecord[];
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('basic');
    });

    it('GET /:id with valid id returns plan', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'basic', name: 'Básico', monthly_price: '29.90' }]));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans/basic');
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord;
      expect(body.id).toBe('basic');
    });

    it('GET /:id with invalid id returns 400', async () => {
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans/invalid-id');
      expect(res.status).toBe(400);
    });

    it('POST / creates a new plan (201)', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([]));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ name: 'Premium', monthly_price: '99.90' }),
      });
      expect(res.status).toBe(201);
    });

    it('POST / returns 409 for duplicate plan id', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'basic' }]));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ name: 'Basic', monthly_price: '29.90' }),
      });
      expect(res.status).toBe(409);
    });

    it('POST / returns 400 for empty body', async () => {
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('PUT /:id updates existing plan', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'basic' }]));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans/basic', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ monthly_price: '19.90' }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Global coupons', () => {
    it('GET / returns all coupons', async () => {
      selectMock.mockImplementation(() => mockSelect([{ id: 'c1', code: 'PROMO10' }]));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons', { headers: { Authorization: 'Bearer t' } });
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord[];
      expect(body).toHaveLength(1);
    });

    it('POST / creates coupon (201)', async () => {
      selectMock.mockImplementation(() => mockSelect([]));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({
          code: 'PROMO20', description: '20% off', discount_type: 'percentage',
          discount_value: '20', max_uses: 100,
          valid_from: '2025-01-01T00:00:00.000Z', valid_until: '2025-12-31T00:00:00.000Z',
        }),
      });
      expect(res.status).toBe(201);
    });

    it('POST / returns 400 for invalid body', async () => {
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('DELETE /:id removes coupon', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'c1' }]));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons/c1', {
        method: 'DELETE',
        headers: { Authorization: 'Bearer t' },
      });
      expect(res.status).toBe(200);
    });
  });

  describe('Auth bypass', () => {
    it('allows request through auth middleware (mocked)', async () => {
      selectMock.mockImplementation(() => mockSelect([]));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons');
      expect(res.status).toBe(200);
    });
  });

  describe('Consumer orders (Fase 33)', () => {
    it('GET /me/orders returns empty array', async () => {
      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', { headers: { Authorization: 'Bearer t' } });
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord[];
      expect(Array.isArray(body)).toBe(true);
    });

    it('GET /me/orders/:id returns 404 when order not found', async () => {
      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders/missing', { headers: { Authorization: 'Bearer t' } });
      expect(res.status).toBe(404);
    });

    it('POST /me/orders returns 400 for empty body', async () => {
      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });

    it('POST /me/orders returns cached response when Idempotency-Key exists (loser)', async () => {
      const cachedBody = { id: 'order-cached', status: 'confirmed', total: '55' };
      insertMock.mockReset();
      insertMock.mockReturnValue({ values: vi.fn().mockRejectedValue(new Error('23505')) });
      selectMock.mockImplementation(() => mockSelect([{
        status: 'completed',
        response_status: 201,
        response_body: cachedBody,
        created_at: new Date(Date.now() - 1000).toISOString(),
      }]));

      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t', 'Idempotency-Key': 'key-existing' },
        body: JSON.stringify({
          restaurant_id: 'rest-1',
          payment_method: 'pix',
          subtotal: 50,
          total: 55,
          customer_name: 'João',
          customer_address: 'Rua A',
          items: [{ menu_item_id: 'item-1', name: 'Pizza', quantity: 1, price: 50 }],
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as BodyRecord;
      expect(body.id).toBe('order-cached');
    }, 10000);

    it('POST /me/orders returns 409 when duplicate Idempotency-Key failed (loser)', async () => {
      insertMock.mockReset();
      insertMock.mockReturnValue({ values: vi.fn().mockRejectedValue(new Error('23505')) });
      selectMock.mockImplementation(() => mockSelect([{
        status: 'failed',
        response_status: null,
        response_body: null,
        created_at: new Date(Date.now() - 1000).toISOString(),
      }]));

      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t', 'Idempotency-Key': 'key-failed' },
        body: JSON.stringify({
          restaurant_id: 'rest-1',
          payment_method: 'pix',
          subtotal: 50,
          total: 55,
          customer_name: 'João',
          customer_address: 'Rua A',
          items: [{ menu_item_id: 'item-1', name: 'Pizza', quantity: 1, price: 50 }],
        }),
      });
      expect(res.status).toBe(409);
    }, 10000);

    it('POST /me/orders processes new order with Idempotency-Key (winner)', async () => {
      selectMock
        .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'João', phone: null }]))
        .mockImplementationOnce(() => mockSelect([{ id: 'item-1' }]))
        .mockImplementationOnce(() => mockSelect([{ id: 'branch-1' }]));

      transactionMock.mockResolvedValue({
        order: { id: 'order-new', status: 'confirmed', total: '55', restaurant_id: 'rest-1', created_at: new Date().toISOString() },
        items: [{ id: 'oi-1', name: 'Pizza', quantity: 1, price: '50' }],
        mirror: { id: 'mo-1' },
        mirrorItems: [],
      });

      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t', 'Idempotency-Key': 'key-new' },
        body: JSON.stringify({
          restaurant_id: 'rest-1',
          payment_method: 'pix',
          subtotal: 50,
          total: 55,
          customer_name: 'João',
          customer_address: 'Rua A',
          items: [{ menu_item_id: 'item-1', name: 'Pizza', quantity: 1, price: 50 }],
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as BodyRecord;
      expect(body.id).toBe('order-new');
    });

    it('POST /me/orders without Idempotency-Key creates order', async () => {
      selectMock
        .mockImplementationOnce(() => mockSelect([{ id: 'user-1', name: 'Maria', phone: null }]))
        .mockImplementationOnce(() => mockSelect([{ id: 'item-2' }]))
        .mockImplementationOnce(() => mockSelect([{ id: 'branch-1' }]));

      transactionMock.mockResolvedValue({
        order: { id: 'order-no-key', status: 'confirmed', total: '30', restaurant_id: 'rest-1', created_at: new Date().toISOString() },
        items: [{ id: 'oi-2', name: 'Burger', quantity: 1, price: '30' }],
        mirror: { id: 'mo-2' },
        mirrorItems: [],
      });

      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({
          restaurant_id: 'rest-1',
          payment_method: 'credit',
          subtotal: 30,
          total: 30,
          customer_name: 'Maria',
          customer_address: 'Rua B',
          items: [{ menu_item_id: 'item-2', name: 'Burger', quantity: 1, price: 30 }],
        }),
      });
      expect(res.status).toBe(201);
      const body = await res.json() as BodyRecord;
      expect(body.id).toBe('order-no-key');
    });

    it('POST /me/orders returns 404 when user not found (winner fails)', async () => {
      selectMock.mockImplementation(() => mockSelect([]));
      const { default: route } = await import('./consumer-orders');
      const app = new Hono().route('/api/me/orders', route);
      const res = await app.request('/api/me/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t', 'Idempotency-Key': 'key-fail-user' },
        body: JSON.stringify({
          restaurant_id: 'rest-1',
          payment_method: 'pix',
          subtotal: 50,
          total: 55,
          customer_name: 'João',
          customer_address: 'Rua A',
          items: [{ menu_item_id: 'item-1', name: 'Pizza', quantity: 1, price: 50 }],
        }),
      });
      expect(res.status).toBe(404);
      const body = await res.json() as { error?: string; code?: string };
      expect(body.code).toBe('USER_NOT_FOUND');
    });
  });

  describe('Branch menu items CRUD (Fase 33)', () => {
    it('GET /branches/:id/menu-items returns empty array', async () => {
      const { default: route } = await import('./branches');
      const app = new Hono().route('/api/branches', route);
      const res = await app.request('/api/branches/branch-1/menu-items');
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord[];
      expect(Array.isArray(body)).toBe(true);
    });

    it('POST /branches/:id/menu-items returns 404 for missing branch', async () => {
      const { default: route } = await import('./branches');
      const app = new Hono().route('/api/branches', route);
      const res = await app.request('/api/branches/missing-branch/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ name: 'Pizza', category: 'mains', price: 49.9 }),
      });
      expect(res.status).toBe(404);
    });

    it('POST /branches/:id/menu-items returns 400 for invalid body', async () => {
      selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'branch-1' }]));
      const { default: route } = await import('./branches');
      const app = new Hono().route('/api/branches', route);
      const res = await app.request('/api/branches/branch-1/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('Operations auth (Fase 33)', () => {
    it('PUT /operations/:branchId/hours now requires auth (passes through with mocked auth)', async () => {
      const { default: route } = await import('./operations');
      const app = new Hono().route('/api/operations', route);
      const res = await app.request('/api/operations/branch-1/hours', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ hours: [] }),
      });
      expect([200, 400]).toContain(res.status);
    });

    it('POST /operations/:branchId/holiday-overrides now requires auth (passes through)', async () => {
      const { default: route } = await import('./operations');
      const app = new Hono().route('/api/operations', route);
      const res = await app.request('/api/operations/branch-1/holiday-overrides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({
          overrideType: 'closed', customDate: '2025-12-25', periods: [],
        }),
      });
      expect([200, 201, 400]).toContain(res.status);
    });
  });
});
