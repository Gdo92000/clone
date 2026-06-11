import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, updateMock } = vi.hoisted(() => {
  const select = vi.fn();
  const update = vi.fn();
  return { selectMock: select, updateMock: update };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: updateMock,
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({
  userNotifications: {
    id: 'id', user_id: 'user_id', title: 'title', body: 'body',
    read: 'read', read_at: 'read_at', created_at: 'created_at',
  },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c, next) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'user-1', role: 'merchant' }),
}));

function mockChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

type BodyRecord = Record<string, unknown>;

describe('user-notifications route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockChain([]));
    updateMock.mockReset();
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  });

  it('GET / returns user notifications', async () => {
    selectMock.mockImplementation(() => mockChain([
      { id: 'notif-1', user_id: 'user-1', title: 'Order ready', read: false },
    ]));
    const { default: route } = await import('./user-notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('notif-1');
  });

  it('PUT /:id/read marks notification as read', async () => {
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([{ id: 'notif-1' }]) }) });
    const { default: route } = await import('./user-notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications/notif-1/read', {
      method: 'PUT',
      headers: { Authorization: 'Bearer t' },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
  });

  it('PUT /read-all marks all notifications as read', async () => {
    const { default: route } = await import('./user-notifications');
    const app = new Hono().route('/api/notifications', route);
    const res = await app.request('/api/notifications/read-all', {
      method: 'PUT',
      headers: { Authorization: 'Bearer t' },
    });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
  });
});
