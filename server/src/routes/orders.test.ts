import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest';

const { dbSelectMock, dbUpdateMock, transactionMock, publishMock, sendPushMock } = vi.hoisted(() => ({
  dbSelectMock: vi.fn(),
  dbUpdateMock: vi.fn(),
  transactionMock: vi.fn(),
  publishMock: vi.fn(),
  sendPushMock: vi.fn(),
}));

vi.mock('../db', () => ({
  db: {
    select: dbSelectMock,
    update: dbUpdateMock,
    transaction: transactionMock,
  },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: { set: (key: string, value: unknown) => void; get: (key: string) => unknown }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'merchant-1', company_id: 'company-1', role: 'merchant' });
    await next();
  }) as unknown as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'merchant-1', email: 'merchant@test.com', role: 'merchant', company_id: 'company-1', branch_id: 'branch-1' }),
}));

vi.mock('../lib/tenant', () => ({
  tenantIsolationMiddleware: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as unknown as MiddlewareHandler,
  getTenantId: () => 'company-1',
}));

vi.mock('../services/sse', () => ({ publish: publishMock }));
vi.mock('../services/push', () => ({ sendPush: sendPushMock, getVapidPublicKey: () => '' }));
vi.mock('../services/printing/service', () => ({ PrintingService: { enqueuePrintJob: vi.fn().mockResolvedValue('job-1') } }));

let app: Hono;

beforeAll(async () => {
  const { default: route } = await import('./orders');
  app = new Hono().route('/api/orders', route);
});

let selectResults: unknown[][] = [];
let transactionImpl: ((cb: (tx: Record<string, unknown>) => Promise<void>) => Promise<void>) | undefined;

function mockSelect(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function resetDbMocks() {
  selectResults = [];
  transactionImpl = undefined;
  dbSelectMock.mockReset();
  dbSelectMock.mockImplementation(() => {
    const data = selectResults.shift() ?? [];
    return mockSelect(data);
  });
  dbUpdateMock.mockReset();
  dbUpdateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  transactionMock.mockReset();
  transactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
    if (transactionImpl) {
      await transactionImpl(cb);
    } else {
      await cb({
        update: (_table: string) => ({
          set: (_data: Record<string, unknown>) => ({
            where: vi.fn().mockResolvedValue(undefined),
          }),
        }),
        select: vi.fn().mockReturnThis(),
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        limit: vi.fn().mockReturnValue({ then: (cb2: (r: unknown[]) => unknown) => Promise.resolve(cb2([])) }),
        insert: vi.fn().mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) }),
      });
    }
  });
  publishMock.mockReset();
  sendPushMock.mockReset();
}

function setupSelectResults(...results: unknown[][]) {
  selectResults = [...results];
  dbSelectMock.mockImplementation(() => {
    const data = selectResults.shift() ?? [];
    return mockSelect(data);
  });
}

function setupTransaction(impl: (cb: (tx: Record<string, unknown>) => Promise<void>) => Promise<void>) {
  transactionImpl = impl;
  transactionMock.mockImplementation(impl as (...args: unknown[]) => Promise<void>);
}

const BASE_ORDER = {
  id: 'order-1',
  branch_id: 'branch-1',
  customer_name: 'João',
  customer_address: 'Rua A',
  status: 'new',
  payment_method: 'pix',
  delivery_type: 'delivery',
  total: '58.80',
  created_at: new Date().toISOString(),
};

const CUSTOMER_ORDER = {
  id: 'order-1',
  user_id: 'customer-1',
  restaurant_id: 'rest-1',
  status: 'confirmed',
  delivery_type: 'delivery',
  total: '58.80',
};

const TX_DEFAULT = {
  update: () => ({ set: () => ({ where: vi.fn().mockResolvedValue(undefined) }) }),
  select: () => ({
    from: () => ({
      where: () => ({
        limit: vi.fn().mockReturnValue({ then: (cb2: (r: unknown[]) => unknown) => Promise.resolve(cb2([])) }),
      }),
    }),
  }),
  from: vi.fn(),
  where: vi.fn(),
  limit: vi.fn(),
  insert: vi.fn(),
};

describe('POST /orders/:id/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  const USER_BRANCH = [{ branch_id: 'branch-1' }];

  describe('Delivery flow (ready → dispatched → delivered)', () => {
    it('transitions from ready to dispatched for delivery', async () => {
      const order = { ...BASE_ORDER, status: 'ready', delivery_type: 'delivery' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'dispatched' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.success).toBe(true);
    });

    it('transitions from dispatched to delivered for delivery', async () => {
      const order = { ...BASE_ORDER, status: 'dispatched', delivery_type: 'delivery' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(200);
    });

    it('blocks ready → delivered for delivery orders', async () => {
      const order = { ...BASE_ORDER, status: 'ready', delivery_type: 'delivery' };
      setupSelectResults([order], USER_BRANCH);

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(500);
    });
  });

  describe('Pickup flow (ready → delivered, skips dispatched)', () => {
    it('transitions from ready to delivered for pickup', async () => {
      const order = { ...BASE_ORDER, status: 'ready', delivery_type: 'pickup' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(200);
    });

    it('blocks ready → dispatched for pickup orders', async () => {
      const order = { ...BASE_ORDER, status: 'ready', delivery_type: 'pickup' };
      setupSelectResults([order], USER_BRANCH);

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'dispatched' }),
      });

      expect(res.status).toBe(500);
    });
  });

  describe('Sync between merchantOrders and orders', () => {
    it('updates orders.status on the same transaction', async () => {
      const order = { ...BASE_ORDER, status: 'accepted' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );

      let ordersUpdateCalled = false;
      setupTransaction(async (cb) => {
        await cb({
          update: (_table: string) => ({
            set: (data: Record<string, unknown>) => {
              if (data.status === 'preparing') {
                ordersUpdateCalled = true;
              }
              return { where: vi.fn().mockResolvedValue(undefined) };
            },
          }),
          select: () => ({
            from: () => ({
              where: () => ({
                limit: vi.fn().mockReturnValue({ then: (cb2: (r: unknown[]) => unknown) => Promise.resolve(cb2([])) }),
              }),
            }),
          }),
          from: vi.fn(),
          where: vi.fn(),
          limit: vi.fn(),
          insert: vi.fn(),
        });
      });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'preparing' }),
      });

      expect(res.status).toBe(200);
      expect(ordersUpdateCalled).toBe(true);
    });

    it('maps merchant rejected to customer cancelled in orders', async () => {
      const order = { ...BASE_ORDER, status: 'new' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );

      let customerStatusSet = '';
      setupTransaction(async (cb) => {
        await cb({
          update: (_table: string) => ({
            set: (data: Record<string, unknown>) => {
              if (typeof data.status === 'string') {
                customerStatusSet = data.status;
              }
              return { where: vi.fn().mockResolvedValue(undefined) };
            },
          }),
          select: () => ({
            from: () => ({
              where: () => ({
                limit: vi.fn().mockReturnValue({ then: (cb2: (r: unknown[]) => unknown) => Promise.resolve(cb2([])) }),
              }),
            }),
          }),
          from: vi.fn(),
          where: vi.fn(),
          limit: vi.fn(),
          insert: vi.fn(),
        });
      });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      expect(res.status).toBe(200);
      expect(customerStatusSet).toBe('cancelled');
    });
  });

  describe('Push notifications', () => {
    it('sends pickup-specific push message for ready', async () => {
      const order = { ...BASE_ORDER, status: 'preparing', delivery_type: 'pickup' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
        [{ endpoint: 'https://push.endpoint', keys: { p256dh: 'key', auth: 'auth' } }],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'ready' }),
      });

      expect(res.status).toBe(200);
      const sendCalls = sendPushMock.mock.calls as [unknown, { body: string }][];
      expect(sendCalls[0]).toBeDefined();
      expect(sendCalls[0][1].body).toContain('retirada');
    });

    it('does not send dispatched push for pickup', async () => {
      const order = { ...BASE_ORDER, status: 'ready', delivery_type: 'pickup' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(200);
      const dispatchedMessage = sendPushMock.mock.calls.find(
        (call: unknown[]) => (call[1] as Record<string, string>).body === 'Seu pedido saiu para entrega.'
      );
      expect(dispatchedMessage).toBeUndefined();
    });
  });

  describe('SSE publish', () => {
    it('publishes to both branch and user topics', async () => {
      const order = { ...BASE_ORDER, status: 'accepted', delivery_type: 'delivery' };
      setupSelectResults(
        [order],
        USER_BRANCH,
        [CUSTOMER_ORDER],
      );
      setupTransaction(async (cb) => { await cb(TX_DEFAULT); });

      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'preparing' }),
      });

      expect(res.status).toBe(200);
      const topics = publishMock.mock.calls.map((call: unknown[]) => call[0]);
      expect(topics).toContain('branch:branch-1');
      expect(topics).toContain('user:customer-1');
    });
  });
});
