import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, deleteMock, mockAuthMiddleware } = vi.hoisted(() => {
  return {
    selectMock: vi.fn(),
    insertMock: vi.fn(),
    deleteMock: vi.fn(),
    mockAuthMiddleware: vi.fn(),
  };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: deleteMock,
  },
}));

vi.mock('../db/schema', () => ({
  subscriptionAddons: {
    subscription_id: 'subscription_id',
    addon_id: 'addon_id',
    activated_at: 'activated_at',
  },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: mockAuthMiddleware,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c, next) => { await next(); }) as MiddlewareHandler,
}));

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

describe('subscription-addons route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeLimitChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('POST /toggle adds an addon when not already assigned', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./subscription-addons');
    const app = new Hono().route('/api/subscription-addons', route);
    const res = await app.request('/api/subscription-addons/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: 's1', addonId: 'a1' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, active: true });
    expect(insertMock).toHaveBeenCalled();
  });

  it('POST /toggle removes an addon when already assigned', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ subscription_id: 's1', addon_id: 'a1' }]));
    const { default: route } = await import('./subscription-addons');
    const app = new Hono().route('/api/subscription-addons', route);
    const res = await app.request('/api/subscription-addons/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: 's1', addonId: 'a1' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, active: false });
    expect(deleteMock).toHaveBeenCalled();
  });

  it('POST /toggle returns 400 for missing fields', async () => {
    const { default: route } = await import('./subscription-addons');
    const app = new Hono().route('/api/subscription-addons', route);
    const res = await app.request('/api/subscription-addons/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('returns 401 without auth', async () => {
    mockAuthMiddleware.mockImplementationOnce(() => {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    });
    const { default: route } = await import('./subscription-addons');
    const app = new Hono().route('/api/subscription-addons', route);
    const res = await app.request('/api/subscription-addons/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ subscriptionId: 's1', addonId: 'a1' }),
    });
    expect(res.status).toBe(401);
  });
});
