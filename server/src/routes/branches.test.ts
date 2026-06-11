import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    innerJoin: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });
  return { mockChain };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined), returning: vi.fn().mockResolvedValue([{ id: 'branch-1', name: 'Filial Teste' }]) })),
    update: vi.fn(() => {
      const whereResult = {
        returning: vi.fn().mockResolvedValue([{ id: 'branch-1', name: 'Atualizada' }]),
        then: vi.fn((cb: (v: unknown) => unknown) => Promise.resolve(cb(undefined))),
      };
      return { set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue(whereResult) }) };
    }),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({ branches: {}, menuItems: {}, additives: {}, merchantOrders: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('jwtPayload', { sub: 'merchant-1', role: 'merchant' });
    await next();
  }) as MiddlewareHandler,
  getTokenPayload: (c: { get: (k: string) => unknown }) => c.get('jwtPayload'),
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/tenant', () => ({
  requireTenantOwnership: () => (async (c: { set: (k: string, v: unknown) => void }, next: () => Promise<void>) => {
    c.set('userCompanyId', 'company-1');
    c.set('userBranchId', 'branch-1');
    await next();
  }) as MiddlewareHandler,
}));

vi.mock('../middleware/planLimits', () => ({
  requirePlanLimit: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const baseBranch = { id: 'branch-1', company_id: 'company-1', name: 'Filial Centro', address: 'Rua A', neighborhood: 'Centro', city: 'São Paulo', state: 'SP', cep: '01000-000', latitude: null, longitude: null, delivery_radius_km: 8, number: null, created_at: new Date(), updated_at: null };

const baseMenuItem = { id: 'item-1', branch_id: 'branch-1', name: 'Pizza', category: 'Pizzas', price: '49.90', is_available: true, description: null, is_visible_to_consumer: true, created_at: new Date(), updated_at: null };

const baseAdditive = { id: 'add-1', menu_item_id: 'item-1', name: 'Borda', price: '5.00' };

describe('branches route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: branchesRoute } = await import('./branches');
    app = new Hono().route('/api/branches', branchesRoute);
  });

  describe('GET /api/branches', () => {
    it('returns list of branches', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseBranch]));
      const res = await app.request('/api/branches');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });
  });

  describe('GET /api/branches/:id/menu-items', () => {
    it('returns menu items with additives', async () => {
      mockedDb.select
        .mockReturnValueOnce(mocks.mockChain([baseMenuItem]))
        .mockReturnValueOnce(mocks.mockChain([baseAdditive]));
      const res = await app.request('/api/branches/branch-1/menu-items');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });

    it('returns empty array when no items', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toEqual([]);
    });
  });

  describe('POST /api/branches/:id/menu-items', () => {
    it('creates menu item', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseBranch]));
      const res = await app.request('/api/branches/branch-1/menu-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Pizza', category: 'Pizzas', price: 49.90 }),
      });
      expect(res.status).toBe(201);
    });

    it('returns 404 for invalid branch', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/invalid/menu-items', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Pizza', category: 'Pizzas', price: 49.90 }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/branches/:id/menu-items/:itemId', () => {
    it('updates menu item', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseMenuItem]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Pizza Atualizada' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when item not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/invalid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Teste' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /api/branches/:id/menu-items/:itemId/availability', () => {
    it('toggles availability', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseMenuItem]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/availability', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: false }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when item not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/invalid/availability', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: false }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/branches/:id/menu-items/:itemId', () => {
    it('deletes menu item', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseMenuItem]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/invalid', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });

  describe('POST /api/branches/:id/menu-items/:itemId/additives', () => {
    it('creates additive', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseMenuItem]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/additives', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Borda', price: 5.00 }),
      });
      expect(res.status).toBe(201);
    });

    it('returns 404 when item not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/invalid/additives', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Borda', price: 5.00 }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('PUT /api/branches/:id/menu-items/:itemId/additives/:additiveId', () => {
    it('updates additive', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseAdditive]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/additives/add-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Borda Requeijão', price: 6.00 }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when additive not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/additives/invalid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Borda', price: 5.00 }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/branches/:id/menu-items/:itemId/additives/:additiveId', () => {
    it('deletes additive', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseAdditive]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/additives/add-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/branch-1/menu-items/item-1/additives/invalid', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/branches/:id/orders', () => {
    it('returns orders for branch', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([{ id: 'order-1', branch_id: 'branch-1', total: '100.00' }]));
      const res = await app.request('/api/branches/branch-1/orders');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });
  });

  describe('POST /api/branches', () => {
    it('creates branch', async () => {
      mockedDb.insert.mockReturnValue({ values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 'branch-1', name: 'Filial Nova', company_id: 'company-1', address: 'Rua B', neighborhood: 'Centro', city: 'SP', state: 'SP' }]) })});
      const res = await app.request('/api/branches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: 'company-1', name: 'Filial Nova', address: 'Rua B', neighborhood: 'Centro', city: 'SP', state: 'SP' }),
      });
      expect(res.status).toBe(201);
    });

    it('returns 400 for invalid body', async () => {
      const res = await app.request('/api/branches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });
      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/branches/:id', () => {
    it('updates branch', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseBranch]));
      const res = await app.request('/api/branches/branch-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Filial Atualizada' }),
      });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/invalid', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Teste' }),
      });
      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/branches/:id', () => {
    it('deletes branch', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([baseBranch]));
      const res = await app.request('/api/branches/branch-1', { method: 'DELETE' });
      expect(res.status).toBe(200);
    });

    it('returns 404 when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/branches/invalid', { method: 'DELETE' });
      expect(res.status).toBe(404);
    });
  });
});
