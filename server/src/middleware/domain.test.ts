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

describe('domainMiddleware', () => {
  let app: Hono;
  let domainMiddleware: MiddlewareHandler;

  beforeEach(async () => {
    vi.clearAllMocks();
    mocks.chain.limit.mockResolvedValue([]);

    const mod = await import('./domain');
    domainMiddleware = mod.domainMiddleware;

    app = new Hono();
    app.use('*', domainMiddleware);
    app.get('/test', (c) => {
      const companyId = c.get('resolvedCompanyId');
      return c.json({ companyId: companyId ?? null });
    });
  });

  it('resolves company_id from custom domain', async () => {
    mocks.chain.limit.mockResolvedValue([{ id: 'company-1' }]);

    const res = await app.request('/test', {
      headers: { host: 'minhaempresa.com' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { companyId: string | null };
    expect(body.companyId).toBe('company-1');
  });

  it('returns null when domain nao encontrado', async () => {
    mocks.chain.limit.mockResolvedValue([]);

    const res = await app.request('/test', {
      headers: { host: 'unknown.com' },
    });

    expect(res.status).toBe(200);
    const body = await res.json() as { companyId: string | null };
    expect(body.companyId).toBeNull();
  });

  it('continues when no host header', async () => {
    const res = await app.request('/test');

    expect(res.status).toBe(200);
    const body = await res.json() as { companyId: string | null };
    expect(body.companyId).toBeNull();
  });
});
