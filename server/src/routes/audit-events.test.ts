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
  auditEvents: {
    id: 'id', actor_id: 'actor_id', action: 'action', target: 'target',
    metadata: {}, created_at: 'created_at',
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
    offset: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

describe('audit-events route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns paginated audit events', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: '1', actor_id: 'user-1', action: 'login', target: 'session', created_at: '2026-01-01' },
    ]));
    const { default: route } = await import('./audit-events');
    const app = new Hono().route('/api/audit', route);
    const res = await app.request('/api/audit');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  }, 15000);

  it('GET /:id returns a single audit event', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: 'evt-1', actor_id: 'user-1', action: 'update', target: 'plan', created_at: '2026-01-01' },
    ]));
    const { default: route } = await import('./audit-events');
    const app = new Hono().route('/api/audit', route);
    const res = await app.request('/api/audit/evt-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('evt-1');
  });

  it('GET /:id returns 404 when not found', async () => {
    selectMock.mockImplementation(() => makeChain([]));
    const { default: route } = await import('./audit-events');
    const app = new Hono().route('/api/audit', route);
    const res = await app.request('/api/audit/nonexistent');
    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({ error: 'Not found' });
  });
});
