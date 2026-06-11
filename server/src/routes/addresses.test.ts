import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockGetTokenPayload = vi.fn(() => ({ sub: 'user-1', role: 'consumer' }));

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
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([]) }),
    })),
    update: vi.fn(() => ({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))),
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    })),
    delete: vi.fn(() => ({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) })),
  },
}));

vi.mock('../db/schema', () => ({ addresses: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: mocks.mockGetTokenPayload,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const baseRow = {
  id: 'addr-1',
  user_id: 'user-1',
  label: 'Casa',
  street: 'Rua A',
  number: '100',
  complement: null,
  neighborhood: null,
  city: 'São Paulo',
  state: 'SP',
  zip_code: '01234-567',
  latitude: null,
  longitude: null,
  is_default: true,
  created_at: new Date('2025-01-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: addressesRoute } = await import('./addresses');
  app = new Hono().route('/me/addresses', addressesRoute);
});

describe('GET /me/addresses', () => {
  it('returns list of addresses', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/me/addresses');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'addr-1', city: 'São Paulo' });
  });

  it('returns empty array when user has no addresses', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/addresses');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(0);
  });
});

describe('POST /me/addresses', () => {
  it('creates a new address and returns 201', async () => {
    const newRow = { ...baseRow, id: 'new-id', is_default: false, created_at: new Date() };
    mockedDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([newRow]) }),
    });

    const res = await app.request('/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ street: 'Rua A', number: '100', city: 'São Paulo', state: 'SP' }),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.street).toBe('Rua A');
  });

  it('returns 400 for missing required fields', async () => {
    const res = await app.request('/me/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /me/addresses/:id', () => {
  it('updates an address and returns the updated row', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const updatedRow = { ...baseRow, street: 'Rua B' };
    const whereObj = {
      then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))),
      returning: vi.fn().mockResolvedValue([updatedRow]),
    };
    mockedDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(whereObj) }),
    });

    const res = await app.request('/me/addresses/addr-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ street: 'Rua B' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.street).toBe('Rua B');
  });

  it('returns 404 when address does not exist', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/addresses/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ street: 'Rua B' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /me/addresses/:id', () => {
  it('deletes address and returns success', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/me/addresses/addr-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when address not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/me/addresses/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});

describe('POST /me/addresses/:id/default', () => {
  it('sets address as default and returns it', async () => {
    const row = { ...baseRow, is_default: false };
    mockedDb.select.mockReturnValue(mocks.mockChain([row]));

    const updatedRow = { ...row, is_default: true };
    const whereObj = {
      then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))),
      returning: vi.fn().mockResolvedValue([updatedRow]),
    };
    mockedDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(whereObj) }),
    });

    const res = await app.request('/me/addresses/addr-1/default', { method: 'POST' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.is_default).toBe(true);
  });
});
