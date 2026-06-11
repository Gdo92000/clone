import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('hono/jwt', () => ({ verify: vi.fn(), jwt: vi.fn(), decode: vi.fn(), sign: vi.fn() }));

describe('requestId middleware', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { requestId } = await import('./requestId');
    app = new Hono();
    app.use('*', requestId);
    app.get('/test', (c) => c.json({ ok: true }));
  });

  it('sets x-request-id header on response', async () => {
    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('x-request-id')).toBeTruthy();
  });

  it('generates unique request IDs for different requests', async () => {
    const res1 = await app.request('/test');
    const res2 = await app.request('/test');
    const id1 = res1.headers.get('x-request-id');
    const id2 = res2.headers.get('x-request-id');
    expect(id1).not.toBe(id2);
  });

  it('preserves client-provided X-Request-Id header', async () => {
    const res = await app.request('/test', {
      headers: { 'X-Request-Id': 'client-id-123' },
    });
    expect(res.headers.get('x-request-id')).toBe('client-id-123');
  });
});
