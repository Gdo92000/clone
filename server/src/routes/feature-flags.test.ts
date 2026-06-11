import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, deleteMock, mockAuthMiddleware } = vi.hoisted(() => {
  return {
    selectMock: vi.fn(),
    insertMock: vi.fn(),
    updateMock: vi.fn(),
    deleteMock: vi.fn(),
    mockAuthMiddleware: vi.fn(),
  };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
  },
}));

vi.mock('../db/schema', () => ({
  feature_flags: {
    id: 'id',
    company_id: 'company_id',
    branch_id: 'branch_id',
    user_id: 'user_id',
    feature_key: 'feature_key',
    enabled: 'enabled',
    reason: 'reason',
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

describe('feature-flags route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all feature flags', async () => {
    selectMock.mockImplementation(() => makeChain([{ id: '1', feature_key: 'new_checkout', enabled: true }]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(1);
  });

  it('GET / filters by company_id', async () => {
    selectMock.mockImplementation(() => makeChain([{ id: '1', company_id: 'c1', feature_key: 'x', enabled: true }]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags?company_id=c1');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(Array.isArray(body)).toBe(true);
  });

  it('POST / creates a new feature flag', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_key: 'new_checkout', enabled: true }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('POST / upserts existing flag', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ id: '1', feature_key: 'new_checkout', enabled: false }]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feature_key: 'new_checkout', enabled: true }),
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true, upserted: true });
  });

  it('POST / returns 400 for invalid body', async () => {
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /:id removes a feature flag', async () => {
    selectMock.mockImplementation(() => makeLimitChain([{ id: '1', feature_key: 'x', enabled: true }]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags/1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ success: true });
  });

  it('DELETE /:id returns 404 when not found', async () => {
    selectMock.mockImplementation(() => makeLimitChain([]));
    const { default: route } = await import('./feature-flags');
    const app = new Hono().route('/api/feature-flags', route);
    const res = await app.request('/api/feature-flags/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
