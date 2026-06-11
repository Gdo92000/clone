import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockGetTokenPayload = vi.fn(() => ({ sub: 'consumer-1', role: 'consumer' }));

  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });

  return { mockChain, mockGetTokenPayload };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    insert: vi.fn(() => ({
      values: vi.fn().mockResolvedValue(undefined),
    })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) })),
  },
}));

vi.mock('../db/schema', () => ({
  supportTickets: {},
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: mocks.mockGetTokenPayload,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const baseTicket = {
  id: 'ticket-1',
  user_id: 'consumer-1',
  title: 'Ajuda com pedido',
  message: 'Meu pedido não chegou',
  status: 'open',
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: supportRoute } = await import('./consumer-support');
  app = new Hono().route('/me/support', supportRoute);
});

describe('POST /me/support', () => {
  it('creates a support ticket and returns 201', async () => {
    const res = await app.request('/me/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ajuda', message: 'Preciso de ajuda' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeTypeOf('string');
  });

  it('returns 400 for missing title', async () => {
    const res = await app.request('/me/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Preciso de ajuda' }),
    });
    expect(res.status).toBe(400);
  });

  it('returns 400 for missing message', async () => {
    const res = await app.request('/me/support', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: 'Ajuda' }),
    });
    expect(res.status).toBe(400);
  });
});

describe('GET /me/support', () => {
  it('returns list of user support tickets', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseTicket]));

    const res = await app.request('/me/support');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'ticket-1', title: 'Ajuda com pedido' });
  });

  it('returns empty when user has no tickets', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/support');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(0);
  });
});
