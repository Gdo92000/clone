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
  const mockGetTokenPayload = vi.fn(() => ({ sub: 'merchant-1', role: 'merchant', company_id: 'company-1' }));
  return { mockChain, mockGetTokenPayload };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({ companies: {}, branches: {}, users: {} }));

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
  getTokenPayload: mocks.mockGetTokenPayload,
}));

vi.mock('../middleware/permission', () => ({
  requirePermission: () => (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: companiesRoute } = await import('./companies');
  app = new Hono().route('/api/companies', companiesRoute);
});

describe('GET /api/companies', () => {
  it('returns list of companies for superadmin', async () => {
    mocks.mockGetTokenPayload.mockReturnValueOnce({ sub: 'super-1', role: 'superadmin' });
    const companies = [{ id: 'company-1', name: 'Empresa A' }, { id: 'company-2', name: 'Empresa B' }];
    mockedDb.select.mockReturnValue(mocks.mockChain(companies));

    const res = await app.request('/api/companies');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(2);
  });

  it('returns company for merchant user (looks up via users table)', async () => {
    mocks.mockGetTokenPayload.mockReturnValueOnce({ sub: 'merchant-1', role: 'merchant' });
    const userRow = [{ company_id: 'company-1' }];
    const company = [{ id: 'company-1', name: 'Minha Empresa' }];

    const chain = mocks.mockChain(userRow);
    const chain2 = mocks.mockChain(company);
    mockedDb.select
      .mockReturnValueOnce(chain)
      .mockReturnValueOnce(chain2);

    const res = await app.request('/api/companies');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it('returns 403 when merchant user has no company_id', async () => {
    mocks.mockGetTokenPayload.mockReturnValueOnce({ sub: 'merchant-1', role: 'merchant' });
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/api/companies');
    expect(res.status).toBe(403);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Acesso negado');
  });
});

describe('GET /api/companies/:id/branches', () => {
  it('returns branches for a valid company', async () => {
    mocks.mockGetTokenPayload.mockReturnValueOnce({ sub: 'super-1', role: 'superadmin' });
    const branches = [{ id: 'branch-1', name: 'Filial Centro', company_id: 'company-1' }];
    mockedDb.select.mockReturnValue(mocks.mockChain(branches));

    const res = await app.request('/api/companies/company-1/branches');
    expect(res.status).toBe(200);
    const body = await res.json() as unknown[];
    expect(body).toHaveLength(1);
  });

  it('returns 403 when merchant tries to access another company branches', async () => {
    mocks.mockGetTokenPayload.mockReturnValueOnce({ sub: 'merchant-1', role: 'merchant', company_id: 'my-company' });
    const userRow = [{ company_id: 'my-company' }];
    mockedDb.select.mockReturnValue(mocks.mockChain(userRow));

    const res = await app.request('/api/companies/other-company/branches');
    expect(res.status).toBe(403);
  });
});
