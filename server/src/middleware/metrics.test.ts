import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';
import { metricsHandler, pathPattern, getMetrics } from './metrics';

describe('pathPattern', () => {
  it('replaces UUIDs', () => {
    expect(pathPattern('/users/550e8400-e29b-41d4-a716-446655440000')).toBe('/users/:uuid');
  });

  it('replaces numeric IDs', () => {
    expect(pathPattern('/orders/123')).toBe('/orders/:id');
  });

  it('leaves static paths', () => {
    expect(pathPattern('/health')).toBe('/health');
  });
});

describe('metricsHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('increments httpRequestCount and observes duration', async () => {
    const app = new Hono();
    app.use(metricsHandler);
    app.get('/test', (c) => c.text('ok'));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
  });

  it('increments httpErrorCount on 4xx', async () => {
    const app = new Hono();
    app.use(metricsHandler);
    app.get('/bad', (c) => c.json({ error: 'bad' }, 400));

    const res = await app.request('/bad');
    expect(res.status).toBe(400);
  });
});

describe('getMetrics', () => {
  it('returns prometheus metrics string', async () => {
    const metrics = await getMetrics();
    expect(typeof metrics).toBe('string');
    expect(metrics).toContain('fluxds_');
  });
});
