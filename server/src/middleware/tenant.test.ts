import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

interface MockChain {
  from: ReturnType<typeof vi.fn> & ((this: MockChain) => MockChain);
  where: ReturnType<typeof vi.fn> & ((this: MockChain) => MockChain);
  limit: ReturnType<typeof vi.fn>;
  innerJoin: ReturnType<typeof vi.fn> & ((this: MockChain) => MockChain);
}

const mocks = vi.hoisted(() => {
  const chain = {} as MockChain;
  chain.from = vi.fn(() => chain);
  chain.where = vi.fn(() => chain);
  chain.limit = vi.fn().mockResolvedValue([]);
  chain.innerJoin = vi.fn(() => chain);
  return { chain };
});

vi.mock('hono/jwt', () => ({ verify: vi.fn(), jwt: vi.fn(), decode: vi.fn(), sign: vi.fn() }));
vi.mock('../db', () => ({ db: { select: vi.fn(() => mocks.chain) } }));

describe('requireTenantOwnership', () => {
  let app: Hono;
  let verify: ReturnType<typeof vi.fn>;
  let authMiddleware: MiddlewareHandler;
  let requireTenantOwnership: (paramName: string) => MiddlewareHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.chain.limit.mockResolvedValue([]);

    const honoMod = await import('hono/jwt');
    verify = honoMod.verify;

    const authMod = await import('./auth');
    authMiddleware = authMod.authMiddleware;

    const tenantMod = await import('./tenant');
    requireTenantOwnership = tenantMod.requireTenantOwnership;

    app = new Hono();
  });

  it('merchant acessa propria filial', async () => {
    mocks.chain.limit.mockResolvedValue([
      { company_id: 'company-1', branch_id: 'branch-1', role: 'merchant' },
    ]);
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant', company_id: 'company-1' });

    app.get('/branches/:branchId', authMiddleware, requireTenantOwnership('branchId'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches/branch-1', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });

  it('merchant negado em filial de outro', async () => {
    mocks.chain.limit.mockResolvedValue([
      { company_id: 'company-1', branch_id: 'branch-1', role: 'merchant' },
    ]);
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant', company_id: 'company-1' });

    app.get('/branches/:branchId', authMiddleware, requireTenantOwnership('branchId'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches/branch-999', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(403);
  });

  it('superadmin acessa qualquer filial', async () => {
    mocks.chain.limit.mockResolvedValue([
      { company_id: 'company-1', branch_id: 'branch-1', role: 'superadmin' },
    ]);
    verify.mockResolvedValue({ sub: 'user-1', role: 'superadmin', company_id: 'company-1' });

    app.get('/branches/:branchId', authMiddleware, requireTenantOwnership('branchId'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches/branch-999', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });
});
