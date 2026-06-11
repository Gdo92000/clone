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
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({
  globalCoupons: {
    id: 'id', code: 'code', description: 'description', discount_type: 'discount_type',
    discount_value: 'discount_value', min_order: 'min_order', max_uses: 'max_uses',
    current_uses: 'current_uses', valid_from: 'valid_from', valid_until: 'valid_until',
    is_active: 'is_active', created_at: 'created_at',
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

describe('global-coupons route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all global coupons', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: '1', code: 'SAVE10', discount_type: 'percentage', discount_value: '10', is_active: true },
    ]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  }, 15000);

  it('GET /:id returns a single coupon', async () => {
    selectMock.mockImplementation(() => makeLimitChain([
      { id: 'c1', code: 'WELCOME', discount_type: 'fixed', discount_value: '15', is_active: true },
    ]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/c1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('c1');
  });

  it('GET /:id returns 404 when coupon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/nonexistent');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('POST / creates a new coupon', async () => {
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: 'FLASH20', discount_type: 'percentage', discount_value: '20',
        valid_from: '2026-01-01T00:00:00Z', valid_until: '2026-12-31T00:00:00Z',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('POST / returns 400 for missing required fields', async () => {
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'INCOMPLETE' }),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id updates an existing coupon', async () => {
    selectMock.mockImplementation(() => makeLimitChain([
      { id: 'c1', code: 'OLD', discount_type: 'percentage', discount_value: '10', is_active: true },
    ]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/c1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount_value: '25' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('PUT /:id returns 404 when coupon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ discount_value: '25' }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('DELETE /:id soft-deletes a coupon', async () => {
    selectMock.mockImplementation(() => makeLimitChain([
      { id: 'c1', code: 'TEMP', discount_type: 'percentage', discount_value: '5', is_active: true },
    ]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/c1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(updateMock).toHaveBeenCalled();
  });

  it('DELETE /:id returns 404 when coupon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./global-coupons');
    const app = new Hono().route('/api/coupons', route);
    const res = await app.request('/api/coupons/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
