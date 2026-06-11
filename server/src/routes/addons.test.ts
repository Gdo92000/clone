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
  addons: {
    id: 'id',
    name: 'name',
    description: 'description',
    monthly_price: 'monthly_price',
    feature_key: 'feature_key',
    is_active: 'is_active',
    created_at: 'created_at',
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

describe('addons route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns active addons', async () => {
    selectMock.mockImplementation(() => makeChain([{ id: '1', name: 'Extra Branch', monthly_price: '29.90', is_active: true }]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
  });

  it('GET /:id returns an addon by id', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ id: '1', name: 'Extra Branch', monthly_price: '29.90' }]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('1');
  });

  it('GET /:id returns 404 when addon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/nonexistent');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });

  it('POST / creates a new addon', async () => {
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Extra Branch', monthly_price: '29.90', feature_key: 'extra_branch' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('POST / returns 400 for invalid body', async () => {
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Incomplete' }),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id updates an addon', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ id: '1', name: 'Extra Branch', monthly_price: '29.90' }]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ monthly_price: '19.90' }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('PUT /:id returns 404 when addon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(404);
  });

  it('DELETE /:id soft-deletes an addon', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ id: '1', name: 'Extra Branch', is_active: true }]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
    expect(updateMock).toHaveBeenCalled();
  });

  it('DELETE /:id returns 404 when addon not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./addons');
    const app = new Hono().route('/api/addons', route);
    const res = await app.request('/api/addons/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
