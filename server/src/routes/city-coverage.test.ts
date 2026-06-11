import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { listActiveCitiesMock, listActiveNeighborhoodsMock, hasActiveRestaurantsInCityMock, hasActiveRestaurantsInNeighborhoodMock } = vi.hoisted(() => ({
  listActiveCitiesMock: vi.fn(),
  listActiveNeighborhoodsMock: vi.fn(),
  hasActiveRestaurantsInCityMock: vi.fn(),
  hasActiveRestaurantsInNeighborhoodMock: vi.fn(),
}));

vi.mock('../services/cityAvailabilityService', () => ({
  listActiveCities: listActiveCitiesMock,
  listActiveNeighborhoods: listActiveNeighborhoodsMock,
  hasActiveRestaurantsInCity: hasActiveRestaurantsInCityMock,
  hasActiveRestaurantsInNeighborhood: hasActiveRestaurantsInNeighborhoodMock,
}));

type BodyRecord = Record<string, unknown>;

describe('city-coverage route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('GET /cities/active returns active cities', async () => {
    listActiveCitiesMock.mockResolvedValue([
      { city: 'São Paulo', state: 'SP', restaurant_count: 42 },
      { city: 'Rio de Janeiro', state: 'RJ', restaurant_count: 18 },
    ]);
    const { default: route } = await import('./city-coverage');
    const app = new Hono().route('/api', route);
    const res = await app.request('/api/cities/active');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(2);
    expect(body[0].city).toBe('São Paulo');
  });

  it('GET /neighborhoods/active returns active neighborhoods for city/state', async () => {
    listActiveNeighborhoodsMock.mockResolvedValue([
      { neighborhood: 'Centro', city: 'São Paulo', state: 'SP', restaurant_count: 5 },
    ]);
    const { default: route } = await import('./city-coverage');
    const app = new Hono().route('/api', route);
    const res = await app.request('/api/neighborhoods/active?city=São Paulo&state=SP');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord[];
    expect(body).toHaveLength(1);
    expect(body[0].neighborhood).toBe('Centro');
  });

  it('GET /neighborhoods/active returns 400 for missing query params', async () => {
    const { default: route } = await import('./city-coverage');
    const app = new Hono().route('/api', route);
    const res = await app.request('/api/neighborhoods/active');
    expect(res.status).toBe(400);
  });

  it('GET /cities/has-coverage returns coverage status', async () => {
    hasActiveRestaurantsInCityMock.mockResolvedValue(true);
    const { default: route } = await import('./city-coverage');
    const app = new Hono().route('/api', route);
    const res = await app.request('/api/cities/has-coverage?city=São Paulo&state=SP');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.covered).toBe(true);
    expect(body.city).toBe('São Paulo');
  });

  it('GET /neighborhoods/has-coverage returns neighborhood coverage', async () => {
    hasActiveRestaurantsInNeighborhoodMock.mockResolvedValue(false);
    const { default: route } = await import('./city-coverage');
    const app = new Hono().route('/api', route);
    const res = await app.request('/api/neighborhoods/has-coverage?city=São Paulo&state=SP&neighborhood=Centro');
    expect(res.status).toBe(200);
    const body = await res.json() as BodyRecord;
    expect(body.covered).toBe(false);
    expect(body.neighborhood).toBe('Centro');
  });
});
