import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { selectMock } = vi.hoisted(() => ({ selectMock: vi.fn() }));

vi.mock('../db', () => ({
  db: {
    select: selectMock,
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  },
}));

vi.mock('../db/schema', () => ({
  companies: {
    id: 'id', name: 'name', theme_config: 'theme_config',
    plan_id: 'plan_id', custom_domain: 'custom_domain',
    is_active: 'is_active', created_at: 'created_at',
  },
}));

function mockLimitChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb([]))),
  };
}

describe('theme route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockLimitChain([]));
  });

  it('GET /me/theme returns default when no companyId', async () => {
    const { default: route } = await import('./theme');
    const app = new Hono().route('/api/theme', route);
    const res = await app.request('/api/theme/me/theme');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.theme).toBe('default');
  });

  it('GET /me/theme returns company theme_config when companyId exists', async () => {
    selectMock.mockImplementation(() => mockLimitChain([{ theme_config: { primaryColor: '#ff0000', mode: 'dark' } }]));
    const { default: route } = await import('./theme');
    const wrapper = new Hono();
    wrapper.use('*', (c, next) => {
      c.set('resolvedCompanyId', 'company-1');
      return next();
    });
    wrapper.route('/api/theme', route);
    const res = await wrapper.request('/api/theme/me/theme');
    expect(res.status).toBe(200);
    const body = await res.json() as { theme: Record<string, unknown> };
    expect(body.theme).toEqual({ primaryColor: '#ff0000', mode: 'dark' });
  });

  it('GET /me/theme returns "default" when company not found', async () => {
    selectMock.mockImplementation(() => mockLimitChain([]));
    const { default: route } = await import('./theme');
    const wrapper = new Hono();
    wrapper.use('*', (c, next) => {
      c.set('resolvedCompanyId', 'company-missing');
      return next();
    });
    wrapper.route('/api/theme', route);
    const res = await wrapper.request('/api/theme/me/theme');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.theme).toBe('default');
  });
});
