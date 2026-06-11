import { describe, it, expect, vi } from 'vitest';
import { Hono } from 'hono';

const mockIncrement = vi.fn().mockResolvedValue({ count: 1, resetAt: Date.now() + 60000 });

vi.mock('../config', () => ({
  REDIS_URL: undefined,
}));

vi.mock('../services/rateLimitStore', () => ({
  InMemoryRateLimitStore: class MockStore {
    increment = mockIncrement;
  },
}));

vi.mock('../services/redisRateLimitStore', () => ({
  RedisRateLimitStore: class MockStore {
    increment = vi.fn();
  },
}));

const { rateLimit } = await import('./rateLimit');

describe('rateLimit middleware', () => {
  it('allows request within limit', async () => {
    mockIncrement.mockResolvedValue({ count: 1, resetAt: Date.now() + 60000 });
    const app = new Hono();
    app.use(rateLimit(5, 60000));
    app.get('/test', (c) => c.text('ok'));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(await res.text()).toBe('ok');
    expect(res.headers.get('X-RateLimit-Limit')).toBe('5');
    expect(res.headers.get('X-RateLimit-Remaining')).toBe('4');
  });

  it('blocks request exceeding limit', async () => {
    mockIncrement.mockResolvedValue({ count: 21, resetAt: Date.now() + 60000 });
    const app = new Hono();
    app.use(rateLimit(1, 60000));
    app.get('/test', (c) => c.text('ok'));

    await app.request('/test');
    const res = await app.request('/test');
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ error: 'Muitas requisições. Tente novamente mais tarde.' });
  });

  it('uses x-forwarded-for for rate limit key', async () => {
    mockIncrement.mockResolvedValue({ count: 1, resetAt: Date.now() + 60000 });
    const app = new Hono();
    app.use(rateLimit(5, 60000));
    app.get('/test', (c) => c.text('ok'));

    await app.request('/test', { headers: { 'x-forwarded-for': '10.0.0.1' } });
    const res = await app.request('/test', { headers: { 'x-forwarded-for': '10.0.0.2' } });
    expect(res.status).toBe(200);
  });
});