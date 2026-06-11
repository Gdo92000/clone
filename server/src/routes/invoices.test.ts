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
  invoices: {
    id: 'id', company_id: 'company_id', amount: 'amount', status: 'status',
    due_date: 'due_date', paid_at: 'paid_at', created_at: 'created_at',
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
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

describe('invoices route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all invoices', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: 'inv-1', company_id: 'c1', amount: '150.00', status: 'open', due_date: '2026-02-01' },
    ]));
    const { default: route } = await import('./invoices');
    const app = new Hono().route('/api/invoices', route);
    const res = await app.request('/api/invoices');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it('GET /:id returns invoices for a company', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: 'inv-1', company_id: 'c1', amount: '150.00', status: 'open' },
    ]));
    const { default: route } = await import('./invoices');
    const app = new Hono().route('/api/invoices', route);
    const res = await app.request('/api/invoices/c1');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it('GET /:id returns 404 when company has no invoices', async () => {
    selectMock.mockImplementation(() => makeChain([]));
    const { default: route } = await import('./invoices');
    const app = new Hono().route('/api/invoices', route);
    const res = await app.request('/api/invoices/nonexistent');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
