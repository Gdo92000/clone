import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock, insertMock, updateMock, deleteMock, transactionMock } = vi.hoisted(() => {
  const select = vi.fn();
  const insert = vi.fn();
  const update = vi.fn();
  const del = vi.fn();
  const tx = vi.fn();
  return { selectMock: select, insertMock: insert, updateMock: update, deleteMock: del, transactionMock: tx };
});

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: insertMock,
    update: updateMock,
    delete: deleteMock,
    transaction: transactionMock,
  },
}));

vi.mock('../db/schema', () => ({
  businessHours: { id: 'id', branch_id: 'branch_id', weekday: 'weekday', is_closed: 'is_closed', is_24h: 'is_24h', sort_order: 'sort_order' },
  businessHourPeriods: { id: 'id', business_hour_id: 'business_hour_id', open_time: 'open_time', close_time: 'close_time', sort_order: 'sort_order' },
  holidayOverrides: { id: 'id', branch_id: 'branch_id', holiday_rule_id: 'holiday_rule_id', override_type: 'override_type', custom_date: 'custom_date' },
  holidayOverridePeriods: { id: 'id', holiday_override_id: 'holiday_override_id', open_time: 'open_time', close_time: 'close_time', sort_order: 'sort_order' },
  specialDates: { id: 'id', branch_id: 'branch_id', date: 'date', label: 'label', is_closed: 'is_closed', is_24h: 'is_24h' },
  specialDatePeriods: { id: 'id', special_date_id: 'special_date_id', open_time: 'open_time', close_time: 'close_time', sort_order: 'sort_order' },
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c, next) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (_c, next) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../services/operations', () => ({
  getBranchOpenStatus: vi.fn().mockResolvedValue({ is_open: true, message: 'Aberto' }),
  getTodayPeriods: vi.fn().mockResolvedValue([{ open_time: '08:00', close_time: '18:00' }]),
}));

function mockChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

function _mockSelectWithLimit(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

type BodyRecord = Record<string, unknown>;

describe('operations route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockChain([]));
    insertMock.mockReset();
    insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
    updateMock.mockReset();
    updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
    deleteMock.mockReset();
    deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
    transactionMock.mockReset();
  });

  it('GET /:branchId/status returns branch open status', async () => {
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/status');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.is_open).toBe(true);
  });

  it('GET /:branchId/today-periods returns periods', async () => {
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/today-periods');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].open_time).toBe('08:00');
  });

  it('GET /:branchId/hours returns business hours with periods', async () => {
    selectMock
      .mockImplementationOnce(() => mockChain([{ id: 'bh-1', weekday: 1 }]))
      .mockImplementationOnce(() => mockChain([{ id: 'p-1', business_hour_id: 'bh-1', open_time: '08:00', sort_order: 0 }]));
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/hours');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('bh-1');
    expect((body[0].periods as BodyRecord[])).toHaveLength(1);
  });

  it('PUT /:branchId/hours replaces business hours via transaction', async () => {
    transactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
      const txSelectChain = {
        from: vi.fn().mockReturnThis(),
        where: vi.fn().mockReturnThis(),
        then: vi.fn((cb2: (r: unknown[]) => unknown) => Promise.resolve(cb2([]))),
      };
      const tx = {
        select: vi.fn().mockReturnValue(txSelectChain),
        insert: insertMock,
        delete: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
      };
      await cb(tx);
    });
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/hours', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({
        branchId: 'branch-1',
        hours: [{ branchId: 'branch-1', weekday: 'monday', isClosed: false, is24h: false, sortOrder: 0, periods: [{ openTime: '08:00', closeTime: '18:00', sortOrder: 0 }] }],
      }),
    });
    expect(res.status).toBe(200);
  });

  it('GET /:branchId/holiday-overrides returns overrides with periods', async () => {
    selectMock
      .mockImplementationOnce(() => mockChain([{ id: 'ho-1', branch_id: 'branch-1', override_type: 'closed', custom_date: '2025-12-25' }]))
      .mockImplementationOnce(() => mockChain([{ id: 'hop-1', holiday_override_id: 'ho-1', open_time: '14:00', sort_order: 0 }]));
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/holiday-overrides');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('ho-1');
  });

  it('POST /:branchId/holiday-overrides creates override via transaction', async () => {
    transactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
      await cb({ insert: insertMock });
    });
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/holiday-overrides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ branchId: 'branch-1', overrideType: 'closed', customDate: '2025-12-25', periods: [] }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as BodyRecord;
    expect(body.success).toBe(true);
  });

  it('DELETE /:branchId/holiday-overrides/:id removes override', async () => {
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/holiday-overrides/ho-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer t' },
    });
    expect(res.status).toBe(200);
  });

  it('GET /:branchId/special-dates returns dates with periods', async () => {
    selectMock
      .mockImplementationOnce(() => mockChain([{ id: 'sd-1', branch_id: 'branch-1', date: '2025-06-15', is_closed: false }]))
      .mockImplementationOnce(() => mockChain([{ id: 'sdp-1', special_date_id: 'sd-1', open_time: '10:00', sort_order: 0 }]));
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/special-dates');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('sd-1');
  });

  it('POST /:branchId/special-dates creates special date via transaction', async () => {
    transactionMock.mockImplementation(async (cb: (tx: Record<string, unknown>) => Promise<void>) => {
      await cb({ insert: insertMock });
    });
    const { default: route } = await import('./operations');
    const app = new Hono().route('/api/operations', route);
    const res = await app.request('/api/operations/branch-1/special-dates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ branchId: 'branch-1', date: '2025-12-25', isClosed: false, is24h: false, periods: [{ openTime: '10:00', closeTime: '22:00', sortOrder: 0 }] }),
    });
    expect(res.status).toBe(201);
  });
});
