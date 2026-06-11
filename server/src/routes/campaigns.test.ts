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

vi.mock('../db/schema', () => ({ campaigns: {}, users: {}, branches: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: unknown, next: () => Promise<void>) => {
    (c as { set: (k: string, v: unknown) => void }).set('jwtPayload', { sub: 'merchant-1', role: 'merchant' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: unknown) => (c as { get: (k: string) => unknown }).get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/planLimits', () => ({
  requirePlanLimit: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const validCampaign = {
  branch_id: 'branch-1',
  name: 'Promoção de Natal',
  description: 'Descontos especiais',
  discount_percentage: '15',
  status: 'active',
  starts_at: '2026-12-01T00:00:00.000Z',
  ends_at: '2026-12-31T23:59:59.000Z',
};

const baseRow = {
  id: 'campaign-1',
  branch_id: 'branch-1',
  name: 'Promoção de Natal',
  description: 'Descontos especiais',
  discount_percentage: '15',
  status: 'active',
  starts_at: new Date('2026-12-01'),
  ends_at: new Date('2026-12-31'),
  created_at: new Date('2026-06-01'),
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: campaignsRoute } = await import('./campaigns');
  app = new Hono().route('/api/campaigns', campaignsRoute);
});

describe('GET /api/campaigns', () => {
  it('returns list of campaigns', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));
    const res = await app.request('/api/campaigns');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });
});

describe('GET /api/campaigns/:id', () => {
  it('returns campaign by id', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/campaigns/campaign-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('campaign-1');
  });

  it('returns 404 when not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/campaigns/nonexistent');
    expect(res.status).toBe(404);
  });
});

describe('POST /api/campaigns', () => {
  it('creates a campaign successfully', async () => {
    const userRow = [{ id: 'merchant-1', role: 'merchant', branch_id: 'branch-1', company_id: 'company-1' }];
    mockedDb.select.mockReturnValue(mocks.mockChain(userRow));
    mockedDb.insert.mockReturnValue({ values: vi.fn().mockResolvedValue(undefined) });

    const res = await app.request('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validCampaign),
    });
    expect(res.status).toBe(201);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
    expect(body.id).toBeDefined();
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/api/campaigns', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/campaigns/:id', () => {
  it('updates a campaign successfully', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/campaigns/campaign-1', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Promoção Atualizada' }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/campaigns/nonexistent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Teste' }),
    });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/campaigns/:id', () => {
  it('deletes a campaign successfully', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseRow]));

    const res = await app.request('/api/campaigns/campaign-1', { method: 'DELETE' });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.success).toBe(true);
  });

  it('returns 404 when not found', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/campaigns/nonexistent', { method: 'DELETE' });
    expect(res.status).toBe(404);
  });
});
