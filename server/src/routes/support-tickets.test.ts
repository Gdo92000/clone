import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });
  return { mockChain };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
  },
}));

vi.mock('../db/schema', () => ({ supportTickets: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'admin-1', role: 'admin' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: { get: (k: string) => unknown }) => c.get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const ticketRow = { id: 'ticket-1', user_id: 'user-1', subject: 'Problema no pedido', status: 'open', created_at: new Date(), updated_at: null };

describe('support-tickets route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: ticketsRoute } = await import('./support-tickets');
    app = new Hono().route('/api/support-tickets', ticketsRoute);
  });

  describe('GET /api/support-tickets', () => {
    it('returns all tickets', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([ticketRow]));
      const res = await app.request('/api/support-tickets');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });
  });

  describe('GET /api/support-tickets/:id', () => {
    it('returns ticket by id', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([ticketRow]));
      const res = await app.request('/api/support-tickets/ticket-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.id).toBe('ticket-1');
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/support-tickets/invalid');
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/support-tickets/:id', () => {
    it('updates ticket status', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([ticketRow]));
      const res = await app.request('/api/support-tickets/ticket-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/support-tickets/invalid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'resolved' }),
      });
      expect(res.status).toBe(404);
    });

    it('returns 400 for invalid status', async () => {
      const res = await app.request('/api/support-tickets/ticket-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'invalid_status' }),
      });
      expect(res.status).toBe(400);
    });
  });
});
