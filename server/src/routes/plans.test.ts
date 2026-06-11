import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, mockAuthMiddleware } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const auth = vi.fn();
  return { selectMock: select, insertMock: insert, updateMock: update, mockAuthMiddleware: auth };
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
    },
  };
});

vi.mock('../db/schema', () => ({ plans: { id: 'id', name: 'name', price: 0, is_active: true } }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: mockAuthMiddleware,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'superadmin' }),
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
};

describe('plans route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
    mockAuthMiddleware.mockImplementation(async (_c: unknown, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all active plans', async () => {
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(Array.isArray(body)).toBe(true);
  });

  it('GET / is public (no auth middleware)', async () => {
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    await app.request('/api/plans');
    expect(mockAuthMiddleware).not.toHaveBeenCalled();
  });

  it('POST / creates a new plan', async () => {
    selectMock.mockImplementation(() => mockSelectWithLimit([]));
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Premium', monthly_price: '99.90' }),
    });
    expect(res.status).toBe(201);
    expect(await res.json()).toEqual({ success: true });
  });

  it('POST / returns 401 without auth', async () => {
    mockAuthMiddleware.mockImplementationOnce(() => {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    });
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Pro', monthly_price: '49.90' }),
    });
    expect(res.status).toBe(401);
  });

  it('POST / returns 400 for invalid body', async () => {
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id updates a plan when it exists', async () => {
    selectMock.mockImplementation(() => mockSelectWithLimit([{ id: 'basic', name: 'Basic', monthly_price: '29.90' }]));
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans/basic', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_price: '19.90' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('PUT /:id returns 404 when plan does not exist', async () => {
    selectMock.mockImplementation(() => mockSelectWithLimit([]));
    const { default: route } = await import('./plans');
    const app = new Hono().route('/api/plans', route);
    const res = await app.request('/api/plans/basic', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_price: '19.90' }),
    });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
