import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, deleteMock } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();
  return { selectMock: select, insertMock: insert, updateMock: update, deleteMock: del };
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
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function mockSelectWithLimit(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    orderBy: vi.fn().mockReturnThis(),
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
    }, 15000);

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

  describe('Coverage cities', () => {
    it('GET / returns cities', async () => {
      selectMock.mockImplementation(() => mockSelect([{ id: '1', city: 'Franca', state: 'SP', is_active: true }]));
      const { default: route } = await import('./coverage-cities');
      const app = new Hono().route('/api/coverage-cities', route);
      const res = await app.request('/api/coverage-cities');
      expect(res.status).toBe(200);
      const body = await res.json() as BodyRecord[];
      expect(body).toHaveLength(1);
      expect(body[0].city).toBe('Franca');
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
});
