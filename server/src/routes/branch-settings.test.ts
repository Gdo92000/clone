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
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({ branchSettings: {} }));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const validSettings = {
  opening_time: '08:00',
  closing_time: '22:00',
  preparation_time: '30',
  minimum_order: '10.00',
  accepts_delivery: true,
  accepts_pickup: true,
  pix_key: 'chave-pix',
};

const baseRow = {
  branch_id: 'branch-1',
  opening_time: '08:00',
  closing_time: '22:00',
  preparation_time: '30',
  minimum_order: '10.00',
  accepts_delivery: true,
  accepts_pickup: true,
  pix_key: 'chave-pix',
  updated_at: new Date('2026-01-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: settingsRoute } = await import('./branch-settings');
  app = new Hono().route('/api/branch-settings', settingsRoute);
});

describe('GET /api/branch-settings/:branchId', () => {
  it('returns settings for a branch', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/branch-settings/branch-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.branch_id).toBe('branch-1');
    expect(body.opening_time).toBe('08:00');
  });

  it('returns empty body when no settings exist', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/branch-settings/branch-1');
    expect(res.status).toBe(200);
    const body = await res.text();
    expect(body).toBe('');
  });
});

describe('PUT /api/branch-settings/:branchId', () => {
  it('creates settings when none exist (upsert)', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));
    mockedDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/api/branch-settings/branch-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validSettings),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('updates existing settings', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/branch-settings/branch-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...validSettings, opening_time: '09:00' }),
    });
    expect(res.status).toBe(200);
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/api/branch-settings/branch-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ opening_time: 'invalid' }),
    });
    expect(res.status).toBe(400);
  });
});
