import { Hono } from 'hono';
import type { MiddlewareHandler } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../middleware/auth', () => ({
  authMiddleware: (async (_c: unknown, next: () => Promise<void>) => { await next(); }) as MiddlewareHandler,
}));

vi.mock('../middleware/permission', () => ({
  requirePermission:
    () =>
    (async (_c: unknown, next: () => Promise<void>) => {
      await next();
    }) as MiddlewareHandler,
}));

vi.mock('../services/cityAvailabilityService', () => ({
  setRestaurantAvailability: vi.fn(),
}));

import { setRestaurantAvailability } from '../services/cityAvailabilityService';

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: availabilityRoute } = await import('./restaurant-availability');
  app = new Hono().route('/restaurants', availabilityRoute);
});

describe('PUT /restaurants/:id/availability', () => {
  it('toggles availability and returns updated restaurant', async () => {
    const updated = { id: 'rest-1', is_active: false };
    vi.mocked(setRestaurantAvailability).mockResolvedValue(updated);

    const res = await app.request('/restaurants/rest-1/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: false }),
    });
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body).toMatchObject({ id: 'rest-1', is_active: false });
  });

  it('returns 404 when restaurant not found', async () => {
    vi.mocked(setRestaurantAvailability).mockResolvedValue(null);

    const res = await app.request('/restaurants/rest-999/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: true }),
    });
    expect(res.status).toBe(404);
    const body = await res.json() as Record<string, unknown>;
    expect(body.error).toBe('Not found');
  });

  it('returns 400 for invalid body', async () => {
    const res = await app.request('/restaurants/rest-1/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: 'invalid' }),
    });
    expect(res.status).toBe(400);
  });
});
