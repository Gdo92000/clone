import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockGetTokenPayload = vi.fn(() => ({ sub: 'consumer-1', role: 'consumer' }));

  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
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
    update: vi.fn(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))),
        }),
      }),
    })),
    delete: vi.fn(() => ({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) })),
  },
}));

vi.mock('../db/schema', () => ({
  orders: {},
  orderItems: {},
  restaurants: {},
  addresses: {},
  users: {},
  idempotencyKeys: {},
  pushSubscriptions: {},
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: mocks.mockGetTokenPayload,
}));

vi.mock('../services/orders/mirrorService', () => ({
  createConsumerOrderWithMirror: vi.fn(),
  MirrorServiceError: class extends Error {
    constructor(message: string, public code: string) {
      super(message);
      this.name = 'MirrorServiceError';
    }
  },
}));

vi.mock('../services/push', () => ({
  sendPush: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);
import { createConsumerOrderWithMirror } from '../services/orders/mirrorService';

const baseOrder = {
  id: 'order-1',
  user_id: 'consumer-1',
  restaurant_id: 'rest-1',
  status: 'pending',
  delivery_type: 'delivery',
  payment_method: 'credit',
  address_id: 'addr-1',
  subtotal: 5000,
  delivery_fee: 500,
  discount: 0,
  total: 5500,
  notes: null,
  estimated_time: null,
  created_at: new Date('2025-01-01'),
  updated_at: new Date('2025-01-01'),
  restaurant_name: 'Test Restaurant',
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: ordersRoute } = await import('./consumer-orders');
  app = new Hono().route('/me/orders', ordersRoute);
});

describe('GET /me/orders', () => {
  it('returns list of consumer orders', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseOrder]));

    const res = await app.request('/me/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'order-1', restaurant_name: 'Test Restaurant' });
  });

  it('returns empty array when user has no orders', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/orders');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(0);
  });
});

describe('GET /me/orders/:id', () => {
  it('returns 404 when order does not exist', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/orders/nonexistent');
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Pedido não encontrado');
  });
});

describe('POST /me/orders', () => {
  const validBody = {
    restaurant_id: 'rest-1',
    payment_method: 'credit' as const,
    address_id: 'addr-1',
    customer_name: 'John Doe',
    customer_address: 'Rua A, 100',
    subtotal: 5000,
    total: 5500,
    items: [{ menu_item_id: 'item-1', name: 'Pizza', quantity: 1, price: 5000 }],
  };

  it('creates order and returns 201', async () => {
    const mockResult = {
      order: { id: 'new-order', status: 'pending', total: 5500, restaurant_id: 'rest-1', created_at: new Date() },
      items: [{ id: 'item-1', name: 'Pizza', quantity: 1, price: 5000 }],
      mirror: { branch_id: 'branch-1' },
      mirrorItems: [],
    };
    vi.mocked(createConsumerOrderWithMirror).mockResolvedValue(mockResult);
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validBody),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toMatchObject({ id: 'new-order', status: 'pending' });
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/me/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});
