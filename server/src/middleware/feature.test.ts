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

describe('requireFeature', () => {
  let app: Hono;
  let verify: ReturnType<typeof vi.fn>;
  let authMiddleware: MiddlewareHandler;
  let requireFeature: (featureKey: string) => MiddlewareHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.chain.limit.mockResolvedValue([]);

    const honoMod = await import('hono/jwt');
    verify = honoMod.verify;
    const authMod = await import('./auth');
    authMiddleware = authMod.authMiddleware;
    const featureMod = await import('./feature');
    requireFeature = featureMod.requireFeature;

    app = new Hono();
  });

  it('permite acesso quando assinatura tem feature', async () => {
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant', company_id: 'company-1' });
    mocks.chain.limit
      .mockResolvedValueOnce([{ id: 'user-1', company_id: 'company-1' }])
      .mockResolvedValueOnce([{ company_id: 'company-1' }])
      .mockResolvedValueOnce([{ id: 'addon-1' }]);

    app.get('/premium', authMiddleware, requireFeature('premium-reports'), (c) => c.json({ ok: true }));

    const res = await app.request('/premium', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });

  it('nega quando assinatura nao tem feature', async () => {
    verify.mockResolvedValue({ sub: 'user-1', role: 'merchant', company_id: 'company-1' });
    mocks.chain.limit
      .mockResolvedValueOnce([{ id: 'user-1', company_id: 'company-1' }])
      .mockResolvedValueOnce([{ company_id: 'company-1' }])
      .mockResolvedValueOnce([]);

    app.get('/premium', authMiddleware, requireFeature('premium-reports'), (c) => c.json({ ok: true }));

    const res = await app.request('/premium', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(403);
  });

  it('superadmin sempre permitido', async () => {
    verify.mockResolvedValue({ sub: 'user-1', role: 'superadmin', company_id: 'company-1' });

    app.get('/premium', authMiddleware, requireFeature('premium-reports'), (c) => c.json({ ok: true }));

    const res = await app.request('/premium', {
      headers: { Authorization: 'Bearer token' },
    }, { JWT_SECRET: 'secret' });

    expect(res.status).toBe(200);
  });
});
