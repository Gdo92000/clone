import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, mockAuthMiddleware } = vi.hoisted(() => {
  return { selectMock: vi.fn(), mockAuthMiddleware: vi.fn() };
});

vi.mock('../db', () => ({
  db: { select: selectMock },
}));

vi.mock('../db/schema', () => ({
  orders: {
    id: 'id', total: 'total', restaurant_id: 'restaurant_id', delivery_type: 'delivery_type',
    status: 'status', user_id: 'user_id', payment_method: 'payment_method',
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
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

describe('admin-reports route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET /platform-metrics returns computed metrics', async () => {
    selectMock.mockImplementation(() => makeChain([
      { totalOrders: 100, totalRevenue: '5000.00', avgTicket: '50.00', activeStores: 10, deliveryCount: 70 },
    ]));
    const { default: route } = await import('./admin-reports');
    const app = new Hono().route('/api/admin/reports', route);
    const res = await app.request('/api/admin/reports/platform-metrics');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.totalOrders).toBe(100);
    expect(body.totalRevenue).toBe('5000.00');
    expect(body.deliveryPercent).toBe(70);
    expect(body.takeoutPercent).toBe(30);
  });

  it('GET /platform-metrics handles zero orders gracefully', async () => {
    selectMock.mockImplementation(() => makeChain([
      { totalOrders: null, totalRevenue: null, avgTicket: null, activeStores: null, deliveryCount: 0 },
    ]));
    const { default: route } = await import('./admin-reports');
    const app = new Hono().route('/api/admin/reports', route);
    const res = await app.request('/api/admin/reports/platform-metrics');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.totalOrders).toBe(0);
    expect(body.totalRevenue).toBe(0);
    expect(body.deliveryPercent).toBe(0);
    expect(body.takeoutPercent).toBe(100);
  });
});
