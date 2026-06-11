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

vi.mock('../db/schema', () => ({ printerConfigs: {}, printJobs: {} }));

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

import { db } from '../db';
const mockedDb = vi.mocked(db);

const configRow = { branch_id: 'branch-1', printer_type: 'network', ip_address: '192.168.1.100', port: 9100, model: 'Epson', enabled: true, created_at: new Date(), updated_at: null };
const jobRow = { id: 'job-1', branch_id: 'branch-1', order_id: 'order-1', status: 'pending', created_at: new Date() };

describe('printing route', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { default: printingRoute } = await import('./printing');
    app = new Hono().route('/api/printing', printingRoute);
  });

  describe('GET /api/printing/config/:branchId', () => {
    it('returns config when found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([configRow]));
      const res = await app.request('/api/printing/config/branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.printer_type).toBe('network');
    });

    it('returns default when not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/printing/config/branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as Record<string, unknown>;
      expect(body.enabled).toBe(false);
    });
  });

  describe('PUT /api/printing/config/:branchId', () => {
    it('updates existing config', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([configRow]));
      const res = await app.request('/api/printing/config/branch-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: false }),
      });
      expect(res.status).toBe(200);
    });

    it('inserts when config not found', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([]));
      const res = await app.request('/api/printing/config/branch-1', {
        method: 'PUT', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printer_type: 'usb', enabled: true }),
      });
      expect(res.status).toBe(200);
    });
  });

  describe('GET /api/printing/history/:branchId', () => {
    it('returns print jobs', async () => {
      mockedDb.select.mockReturnValue(mocks.mockChain([jobRow]));
      const res = await app.request('/api/printing/history/branch-1');
      expect(res.status).toBe(200);
      const body = await res.json() as unknown[];
      expect(body).toHaveLength(1);
    });
  });
});
