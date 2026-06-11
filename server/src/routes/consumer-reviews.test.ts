import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const mockChain = (result?: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (val: unknown[]) => unknown) => Promise.resolve(cb(result ?? []))),
  });

  return { mockChain };
});

vi.mock('../db', () => ({
  db: {
    select: vi.fn(() => mocks.mockChain()),
    insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
    update: vi.fn(() => ({ set: vi.fn().mockReturnValue({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) }) })),
    delete: vi.fn(() => ({ where: vi.fn().mockReturnValue({ then: vi.fn().mockImplementation((cb: (val: unknown) => unknown) => Promise.resolve(cb(undefined))) }) })),
  },
}));

vi.mock('../db/schema', () => ({
  reviews: {},
  users: {},
}));

import { db } from '../db';
const mockedDb = vi.mocked(db);

const baseReview = {
  id: 'rev-1',
  user_id: 'user-1',
  restaurant_id: 'rest-1',
  order_id: 'order-1',
  rating: 5,
  comment: 'Excelente!',
  created_at: new Date('2025-01-01'),
  author_name: 'João',
};

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: reviewsRoute } = await import('./consumer-reviews');
  app = new Hono().route('/reviews', reviewsRoute);
});

describe('GET /reviews', () => {
  it('returns all reviews', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseReview]));

    const res = await app.request('/reviews');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0]).toMatchObject({ id: 'rev-1', rating: 5, author_name: 'João' });
  });

  it('filters by restaurant_id query param', async () => {
    const chain = mocks.mockChain([baseReview]);
    mockedDb.select.mockReturnValue(chain);

    const res = await app.request('/reviews?restaurant_id=rest-1');
    expect(res.status).toBe(200);
    expect(chain.where).toHaveBeenCalled();
  });

  it('returns empty array when no reviews exist', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/reviews');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(0);
  });
});

describe('GET /reviews/restaurant/:id', () => {
  it('returns reviews for a specific restaurant', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([baseReview]));

    const res = await app.request('/reviews/restaurant/rest-1');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(1);
    expect(body[0].restaurant_id).toBe('rest-1');
  });

  it('returns empty when restaurant has no reviews', async () => {
    mockedDb.select.mockReturnValue(mocks.mockChain([]));

    const res = await app.request('/reviews/restaurant/rest-999');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(0);
  });
});
