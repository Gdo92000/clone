import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';



vi.mock('../db', () => {
  const mockChain = (result: any[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: any) => Promise.resolve(cb(result))),
  });

  const db = {
    _plans: [] as any[],
    _coupons: [] as any[],
    _cities: [] as any[],
    select: vi.fn().mockImplementation(function (this: any) {
      return mockChain(this._plans);
    }),
    insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
    update: vi.fn().mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) }),
    delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  };
  return { db };
});

vi.mock('../middleware/auth', () => ({
  authMiddleware: async (_c: any, next: any) => { await next(); },
  getTokenPayload: () => ({ sub: 'admin-1', email: 'admin@test.com', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => async (_c: any, next: any) => { await next(); },
}));

import { db } from '../db';

describe('Route integration tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (db.select as any).mockReset();

    const mockChain = (result: any[]) => ({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      orderBy: vi.fn().mockReturnThis(),
      then: vi.fn((cb: any) => Promise.resolve(cb(result))),
    });

    (db.select as any).mockImplementation((..._args: any[]) => {
      return mockChain([]);
    });

    (db.insert as any).mockReset();
    (db.insert as any).mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    (db.update as any).mockReset();
    (db.update as any).mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    (db.delete as any).mockReset();
    (db.delete as any).mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  describe('Plans', () => {
    it('GET / returns empty array when no plans', async () => {
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(Array.isArray(body)).toBe(true);
    }, 15000);

    it('GET / returns plans from DB', async () => {
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([{ id: 'basic', name: 'Básico', monthly_price: '29.90', is_active: true }]))),
      }));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans');
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].id).toBe('basic');
    });

    it('GET /:id with valid id returns plan', async () => {
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([{ id: 'basic', name: 'Básico', monthly_price: '29.90' }])) }),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([]))),
      }));
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans/basic');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.id).toBe('basic');
    });

    it('GET /:id with invalid id returns 400', async () => {
      const { default: route } = await import('./plans');
      const app = new Hono().route('/api/plans', route);
      const res = await app.request('/api/plans/invalid-id');
      expect(res.status).toBe(400);
    });

    it('POST / creates a new plan (201)', async () => {
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([])) }),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([]))),
      }));
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
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([{ id: 'basic' }])) }),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([{ id: 'basic' }]))),
      }));
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
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([{ id: 'basic' }])) }),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([{ id: 'basic' }]))),
      }));
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
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([{ id: '1', city: 'Franca', state: 'SP', is_active: true }]))),
      }));
      const { default: route } = await import('./coverage-cities');
      const app = new Hono().route('/api/coverage-cities', route);
      const res = await app.request('/api/coverage-cities');
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
      expect(body[0].city).toBe('Franca');
    });
  });

  describe('Global coupons', () => {
    it('GET / returns all coupons', async () => {
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([{ id: 'c1', code: 'PROMO10' }]))),
      }));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons', { headers: { Authorization: 'Bearer t' } });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body).toHaveLength(1);
    });

    it('POST / creates coupon (201)', async () => {
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([]))),
      }));
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
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([{ id: 'c1' }])) }),
        orderBy: vi.fn().mockReturnValue({ then: (cb: any) => Promise.resolve(cb([])) }),
        then: vi.fn((cb: any) => Promise.resolve(cb([]))),
      }));
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
      (db.select as any).mockImplementation(() => ({
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnThis(),
        orderBy: vi.fn().mockReturnThis(),
        then: vi.fn((cb: any) => Promise.resolve(cb([]))),
      }));
      const { default: route } = await import('./global-coupons');
      const app = new Hono().route('/api/global-coupons', route);
      const res = await app.request('/api/global-coupons');
      expect(res.status).toBe(200);
    });
  });
});
