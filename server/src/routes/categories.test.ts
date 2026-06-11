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
  categories: {
    id: 'id', name: 'name', slug: 'slug',
    icon: 'icon', store_count: 'store_count',
    is_active: 'is_active', created_at: 'created_at',
  },
}));

function mockChain(result: unknown[]) {
  return {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockReturnValue({ then: (cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result)) }),
    then: vi.fn((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  };
}

describe('categories route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    selectMock.mockReset();
    selectMock.mockImplementation(() => mockChain([]));
  });

  it('GET / returns empty array when no categories', async () => {
    const { default: route } = await import('./categories');
    const app = new Hono().route('/api/categories', route);
    const res = await app.request('/api/categories');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>[];
    expect(Array.isArray(body)).toBe(true);
    expect(body).toHaveLength(0);
  });

  it('GET / returns all categories ordered by name', async () => {
    selectMock.mockImplementation(() => mockChain([
      { id: 'cat-1', name: 'Pizza', slug: 'pizza', store_count: 10 },
      { id: 'cat-2', name: 'Burger', slug: 'burger', store_count: 5 },
    ]));
    const { default: route } = await import('./categories');
    const app = new Hono().route('/api/categories', route);
    const res = await app.request('/api/categories');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>[];
    expect(body).toHaveLength(2);
  });

  it('GET / returns categories from DB correctly shaped', async () => {
    selectMock.mockImplementation(() => mockChain([
      { id: 'cat-1', name: 'Pizza', slug: 'pizza', icon: '🍕', store_count: 10, is_active: true },
    ]));
    const { default: route } = await import('./categories');
    const app = new Hono().route('/api/categories', route);
    const res = await app.request('/api/categories');
    const body = await res.json() as Record<string, unknown>[];
    expect(body[0].id).toBe('cat-1');
    expect(body[0].slug).toBe('pizza');
  });
});
