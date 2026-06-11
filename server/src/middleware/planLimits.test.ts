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

describe('requirePlanLimit', () => {
  let app: Hono;
  let verify: ReturnType<typeof vi.fn>;
  let authMiddleware: MiddlewareHandler;
  let requirePlanLimit: (resourceType: string) => MiddlewareHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.chain.limit.mockResolvedValue([{ count: 0 }]);

    const honoMod = await import('hono/jwt');
    verify = honoMod.verify;
    const authMod = await import('./auth');
    authMiddleware = authMod.authMiddleware;
    const planMod = await import('./planLimits');
    requirePlanLimit = planMod.requirePlanLimit;

    app = new Hono();
  });

  it('permite quando dentro do limite do plano', async () => {
    mocks.chain.limit
      .mockResolvedValueOnce([{ company_id: 'company-1' }])
      .mockResolvedValueOnce([{ plan_id: 'plan-basic' }])
      .mockResolvedValueOnce([{ id: 'plan-basic', max_branches: 5 }]);
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant' });

    app.get('/branches', authMiddleware, requirePlanLimit('branches'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });

  it('bloqueia quando plano nao inclui recurso', async () => {
    mocks.chain.limit
      .mockResolvedValueOnce([{ company_id: 'company-1' }])
      .mockResolvedValueOnce([{ plan_id: 'plan-basic' }])
      .mockResolvedValueOnce([{ id: 'plan-basic', max_branches: 0 }]);
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant' });

    app.get('/branches', authMiddleware, requirePlanLimit('branches'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(403);
  });

  it('superadmin ignora limite', async () => {
    verify.mockResolvedValue({ sub: 'user-1', role: 'superadmin' });

    app.get('/branches', authMiddleware, requirePlanLimit('branches'), (c) => c.json({ ok: true }));

    const res = await app.request('/branches', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });
});
