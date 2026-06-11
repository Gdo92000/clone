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
  capabilities: {
    id: 'id', feature_key: 'feature_key', name: 'name',
    description: 'description', monthly_price: 'monthly_price',
    category: 'category', charge_type: 'charge_type',
    required_plan: 'required_plan', dependencies: 'dependencies',
    created_at: 'created_at',
  },
}));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c, next) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: () => ({ sub: 'admin-1', role: 'superadmin' }),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c, next) => { await next(); }) as MiddlewareHandler,
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

function mockLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

const resetMocks = () => {
  selectMock.mockReset();
  selectMock.mockImplementation(() => mockChain([]));
  insertMock.mockReset();
  insertMock.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });
  updateMock.mockReset();
  updateMock.mockReturnValue({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) });
  deleteMock.mockReset();
  deleteMock.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) });
};

describe('capabilities route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resetMocks();
  });

  it('GET / returns all capabilities', async () => {
    selectMock.mockImplementation(() => mockChain([
      { id: 'cap-1', feature_key: 'multi_branch', name: 'Multi Branch', category: 'core' },
    ]));
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>[];
    expect(body).toHaveLength(1);
    expect(body[0].id).toBe('cap-1');
  });

  it('POST / creates a capability and returns 201', async () => {
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ feature_key: 'multi_branch', name: 'Multi Branch', category: 'core' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(typeof body.id).toBe('string');
  });

  it('POST / returns 400 for invalid body', async () => {
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });

  it('PUT /:id updates existing capability', async () => {
    selectMock.mockImplementation(() => mockLimitChain([{ id: 'cap-1' }]));
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities/cap-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ name: 'Updated Name' }),
    });
    expect(res.status).toBe(200);
  });

  it('PUT /:id returns 404 when not found', async () => {
    selectMock.mockImplementation(() => mockLimitChain([]));
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer t' },
      body: JSON.stringify({ name: 'Updated' }),
    });
    expect(res.status).toBe(404);
  });

  it('DELETE /:id removes capability', async () => {
    selectMock.mockImplementation(() => mockLimitChain([{ id: 'cap-1' }]));
    const { default: route } = await import('./capabilities');
    const app = new Hono().route('/api/capabilities', route);
    const res = await app.request('/api/capabilities/cap-1', {
      method: 'DELETE',
      headers: { Authorization: 'Bearer t' },
    });
    expect(res.status).toBe(200);
  });
});
