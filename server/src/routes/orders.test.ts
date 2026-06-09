import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

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
  authMiddleware: (async (c: { set: ReturnType<typeof vi.fn>; get: ReturnType<typeof vi.fn> }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'merchant-1', company_id: 'company-1', role: 'merchant' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'merchant-1', email: 'merchant@test.com', role: 'merchant', company_id: 'company-1' }),
}));

vi.mock('../lib/tenant', () => ({
  tenantIsolationMiddleware: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTenantId: () => 'company-1',
}));

vi.mock('../services/sse', () => ({ publish: publishMock }));
vi.mock('../services/push', () => ({ sendPush: sendPushMock, getVapidPublicKey: () => '' }));
vi.mock('../services/printing/service', () => ({ PrintingService: { enqueuePrintJob: vi.fn().mockResolvedValue('job-1') } }));

function mockSelect(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function mockSelectWithLimit(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    orderBy: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

function resetDbMocks() {
  dbSelectMock.mockReset();
  dbSelectMock.mockImplementation(() => mockSelect([]));
  dbUpdateMock.mockReset();
  dbUpdateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  transactionMock.mockReset();
  transactionMock.mockImplementation(async (cb: (tx: unknown) => Promise<void>) => {
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
  });
  publishMock.mockReset();
  sendPushMock.mockReset();
}

function alwaysReturnsDataMock(result: unknown[]) {
  const m = mockSelect(result);
  // make it work even after mockImplementationOnce exhaustion
  m.then = vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)));
  return m;
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

function mockDbForStatus(fromStatus: string, deliveryType = 'delivery') {
  const order = { ...BASE_ORDER, status: fromStatus, delivery_type: deliveryType };
  const selectFirstCall = mockSelectWithLimit([order]);
  const selectCustomer = mockSelectWithLimit([{ ...CUSTOMER_ORDER, delivery_type: deliveryType }]);

  dbSelectMock
    .mockImplementationOnce(() => selectFirstCall)
    .mockImplementationOnce(() => selectCustomer);

  transactionMock.mockImplementation(async (cb: (tx: Record<string, ReturnType<typeof vi.fn>>) => Promise<void>) => {
    await cb({
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
    });
  });

  publishMock.mockReset();
  sendPushMock.mockReset();
}

describe('POST /orders/:id/status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetDbMocks();
  });

  describe('Delivery flow (ready → dispatched → delivered)', () => {
    it('transitions from ready to dispatched for delivery', async () => {
      mockDbForStatus('ready', 'delivery');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
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
      mockDbForStatus('dispatched', 'delivery');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(200);
    });

    it('blocks ready → delivered for delivery orders', async () => {
      mockDbForStatus('ready', 'delivery');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
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
      mockDbForStatus('ready', 'pickup');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      const res = await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      expect(res.status).toBe(200);
    });

    it('blocks ready → dispatched for pickup orders', async () => {
      mockDbForStatus('ready', 'pickup');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
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
      const selectFirstCall = mockSelectWithLimit([order]);
      const selectCustomer = mockSelectWithLimit([CUSTOMER_ORDER]);

      dbSelectMock
        .mockImplementationOnce(() => selectFirstCall)
        .mockImplementationOnce(() => selectCustomer);

      let ordersUpdateCalled = false;
      transactionMock.mockImplementation(async (cb: (tx: Record<string, ReturnType<typeof vi.fn>>) => Promise<void>) => {
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
        });
      });

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'preparing' }),
      });

      expect(ordersUpdateCalled).toBe(true);
    });

    it('maps merchant rejected to customer cancelled in orders', async () => {
      const order = { ...BASE_ORDER, status: 'new' };
      const selectFirstCall = mockSelectWithLimit([order]);
      const selectCustomer = mockSelectWithLimit([CUSTOMER_ORDER]);

      dbSelectMock
        .mockImplementationOnce(() => selectFirstCall)
        .mockImplementationOnce(() => selectCustomer);

      let customerStatusSet = '';
      transactionMock.mockImplementation(async (cb: (tx: Record<string, ReturnType<typeof vi.fn>>) => Promise<void>) => {
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
        });
      });

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      expect(customerStatusSet).toBe('cancelled');
    });
  });

  describe('Push notifications', () => {
    it('sends pickup-specific push message for ready', async () => {
      const order = { ...BASE_ORDER, status: 'preparing', delivery_type: 'pickup' };
      const selectFirstCall = mockSelectWithLimit([order]);
      const selectCustomer = mockSelectWithLimit([CUSTOMER_ORDER]);

      dbSelectMock
        .mockImplementationOnce(() => selectFirstCall)
        .mockImplementationOnce(() => selectCustomer)
        .mockImplementationOnce(() => mockSelect([{ endpoint: 'https://push.endpoint', keys: { p256dh: 'key', auth: 'auth' } }]));

      transactionMock.mockImplementation(async (cb: (tx: Record<string, ReturnType<typeof vi.fn>>) => Promise<void>) => {
        await cb({
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
        });
      });

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'ready' }),
      });

      const pushCall = sendPushMock.mock.calls[0] as [unknown, { body: string }] | undefined;
      expect(pushCall).toBeDefined();
      expect(pushCall[1].body).toContain('retirada');
    });

    it('does not send dispatched push for pickup', async () => {
      mockDbForStatus('ready', 'pickup');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'delivered' }),
      });

      const dispatchedMessage = sendPushMock.mock.calls.find(
        (call: unknown[]) => (call[1] as Record<string, string>).body === 'Seu pedido saiu para entrega.'
      );
      expect(dispatchedMessage).toBeUndefined();
    });
  });

  describe('SSE publish', () => {
    it('publishes to both branch and user topics', async () => {
      mockDbForStatus('accepted', 'delivery');

      const { default: route } = await import('./orders');
      const app = new Hono().route('/api/orders', route);
      await app.request('/api/orders/order-1/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
        body: JSON.stringify({ status: 'preparing' }),
      });

      const topics = publishMock.mock.calls.map((call: unknown[]) => call[0]);
      expect(topics).toContain('branch:branch-1');
      expect(topics).toContain('user:customer-1');
    });
  });
});
