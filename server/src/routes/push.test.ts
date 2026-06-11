import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, deleteMock } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();
  return { selectMock: select, insertMock: insert, updateMock: update, deleteMock: del };
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
  pushSubscriptions: {
    id: 'id', user_id: 'user_id', endpoint: 'endpoint',
    keys: 'keys', device_info: 'device_info',
    user_agent: 'user_agent', created_at: 'created_at',
  },
}));

vi.mock('../services/push', () => ({
  getVapidPublicKey: () => 'mock-public-key',
  sendPush: vi.fn().mockResolvedValue(true),
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c, next) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'user-1', role: 'merchant' }),
}));

vi.mock('../lib/logger', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn() },
}));

function mockSelectWithThen(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function mockLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

type BodyRecord = Record<string, unknown>;

describe('push route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockSelectWithThen([]));
    insertMock.mockReset();
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReset();
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    deleteMock.mockReset();
    deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
  });

  it('GET /vapid-public-key returns the public key', async () => {
    const { default: route } = await import('./push');
    const app = new Hono().route('/api/push', route);
    const res = await app.request('/api/push/vapid-public-key', { headers: { Authorization: 'Bearer t' } });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.publicKey).toBe('mock-public-key');
  });

  it('POST /subscribe creates a new subscription (201)', async () => {
    selectMock.mockImplementation(() => mockLimitChain([]));
    const { default: route } = await import('./push');
    const app = new Hono().route('/api/push', route);
    const res = await app.request('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/test',
        keys: { p256dh: 'key1', auth: 'auth1' },
      }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
    expect(typeof body.id).toBe('string');
  });

  it('POST /subscribe updates existing subscription', async () => {
    selectMock.mockImplementation(() => mockLimitChain([{ id: 'sub-1' }]));
    const { default: route } = await import('./push');
    const app = new Hono().route('/api/push', route);
    const res = await app.request('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({
        endpoint: 'https://fcm.googleapis.com/test',
        keys: { p256dh: 'newkey', auth: 'newauth' },
      }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
    expect(body.id).toBe('sub-1');
  });

  it('POST /subscribe returns 400 for invalid body', async () => {
    const { default: route } = await import('./push');
    const app = new Hono().route('/api/push', route);
    const res = await app.request('/api/push/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('DELETE /subscribe removes a subscription', async () => {
    const { default: route } = await import('./push');
    const app = new Hono().route('/api/push', route);
    const res = await app.request('/api/push/subscribe', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ endpoint: 'https://fcm.googleapis.com/test' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
  });
});
