import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, mockAuthMiddleware } = vi.hoisted(() => {
  return { selectMock: vi.fn(), insertMock: vi.fn(), mockAuthMiddleware: vi.fn() };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
  },
}));

vi.mock('../db/schema', () => ({
  notifications: {
    id: 'id', title: 'title', message: 'message', target: 'target',
    plan_id: 'plan_id', sent_by: 'sent_by', delivered_count: 'delivered_count',
    read_count: 'read_count', created_at: 'created_at',
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
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

describe('notifications route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockImplementation(() => makeChain([]));
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    mockAuthMiddleware.mockImplementation(async (_c, next: () => Promise<void>) => { await next(); });
  });

  it('GET / returns all notifications ordered by created_at desc', async () => {
    selectMock.mockImplementation(() => makeChain([
      { id: 'n1', title: 'Maintenance', message: 'System down tonight', target: 'all', sent_by: 'admin' },
    ]));
    const { default: route } = await import('./notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  }, 15000);

  it('POST / creates a new notification', async () => {
    const { default: route } = await import('./notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'Scheduled Maintenance', message: 'System will be down from 2AM to 4AM',
        target: 'all', sent_by: 'admin@fluxds.com',
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('POST / returns 400 for missing required fields', async () => {
    const { default: route } = await import('./notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Incomplete' }),
    });
    expect(res.status).toBe(400);
  });
});
