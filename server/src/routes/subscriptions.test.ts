import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, mockAuthMiddleware } = vi.hoisted(() => {
  return {
    selectMock: vi.fn(),
    insertMock: vi.fn(),
    updateMock: vi.fn(),
    mockAuthMiddleware: vi.fn(),
  };
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
  subscriptions: {
    company_id: 'company_id',
    plan_id: 'plan_id',
    addon_ids: 'addon_ids',
    billing_status: 'billing_status',
    trial_ends_at: 'trial_ends_at',
    current_period_ends_at: 'current_period_ends_at',
    blocked_reason: 'blocked_reason',
    created_at: 'created_at',
    updated_at: 'updated_at',
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

describe('subscriptions route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all subscriptions', async () => {
    selectMock.mockImplementation(() => makeChain([{ company_id: 'c1', plan_id: 'pro', billing_status: 'active' }]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
  });

  it('GET /:id returns a subscription by company_id', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ company_id: 'c1', plan_id: 'pro', billing_status: 'active' }]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions/c1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.company_id).toBe('c1');
  });

  it('GET /:id returns 404 when not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions/nonexistent');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('POST / creates a new subscription', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: 'c1',
        plan_id: 'pro',
        current_period_ends_at: '2026-12-31T23:59:59Z',
      }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true });
  });

  it('POST / upserts existing subscription', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ company_id: 'c1', plan_id: 'basic', billing_status: 'trial' }]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        company_id: 'c1',
        plan_id: 'pro',
        current_period_ends_at: '2026-12-31T23:59:59Z',
      }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, upserted: true });
  });

  it('POST / returns 400 for invalid body', async () => {
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: 'c1' }),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id updates a subscription', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ company_id: 'c1', plan_id: 'basic', billing_status: 'active' }]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions/c1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: 'premium', current_period_ends_at: '2026-12-31T23:59:59Z' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('PUT /:id returns 404 when not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan_id: 'premium', current_period_ends_at: '2026-12-31T23:59:59Z' }),
    });
    expect(res.status).toBe(404);
  });

  it('returns 401 without auth', async () => {
    mockAuthMiddleware.mockImplementationOnce(() => {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    });
    const { default: route } = await import('./subscriptions');
    const app = new Hono().route('/api/subscriptions', route);
    const res = await app.request('/api/subscriptions');
    expect(res.status).toBe(401);
  });
});
