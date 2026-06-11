import { Hono } from 'hono';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const mocks = vi.hoisted(() => {
  const buildChain = (result: unknown[]) => ({
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    then: vi.fn().mockImplementation((cb: (r: unknown[]) => unknown) => Promise.resolve(cb(result))),
  });
  return { buildChain };
});

const dbSelectMock = vi.fn();

vi.mock('../db', () => ({
  db: {
    select: dbSelectMock,
  },
}));

vi.mock('../db/schema', () => ({
  menuItems: { id: 'id', name: 'name', is_visible_to_consumer: true },
  additives: { id: 'id', name: 'name', menu_item_id: 'menu_item_id' },
}));

let app: Hono;

beforeEach(async () => {
  vi.clearAllMocks();
  const { default: menuItemsRoute } = await import('./menu-items');
  app = new Hono().route('/', menuItemsRoute);
});

describe('GET /', () => {
  it('returns all visible items with their additives', async () => {
    const items = [
      { id: '1', name: 'Item 1', price: 10 },
      { id: '2', name: 'Item 2', price: 15 },
    ];
    const addItem1 = [{ id: 'a1', name: 'Additive A', menu_item_id: '1', price: 2 }];
    const addItem2 = [{ id: 'b1', name: 'Additive B', menu_item_id: '2', price: 3 }];

    dbSelectMock
      .mockReturnValueOnce(mocks.buildChain(items))
      .mockReturnValueOnce(mocks.buildChain(addItem1))
      .mockReturnValueOnce(mocks.buildChain(addItem2));

    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toHaveLength(2);
    expect(body[0].additives).toEqual(addItem1);
    expect(body[1].additives).toEqual(addItem2);
  });

  it('returns empty array when no visible items exist', async () => {
    dbSelectMock.mockReturnValueOnce(mocks.buildChain([]));

    const res = await app.request('/');
    expect(res.status).toBe(200);
    const body = await res.json() as Array<Record<string, unknown>>;
    expect(body).toEqual([]);
  });
});

describe('GET /:id', () => {
  it('returns a single item with additives', async () => {
    const item = [{ id: '1', name: 'Item 1', price: 10 }];
    const add = [{ id: 'a1', name: 'Additive A', menu_item_id: '1', price: 2 }];

    dbSelectMock
      .mockReturnValueOnce(mocks.buildChain(item))
      .mockReturnValueOnce(mocks.buildChain(add));

    const res = await app.request('/1');
    expect(res.status).toBe(200);
    const body = await res.json() as Record<string, unknown>;
    expect(body.id).toBe('1');
    expect(body.additives).toEqual(add);
  });

  it('returns 404 when item is not found', async () => {
    dbSelectMock.mockReturnValueOnce(mocks.buildChain([]));

    const res = await app.request('/999');
    expect(res.status).toBe(404);
    const body = await res.json() as { error: string };
    expect(body).toEqual({ error: 'Not found' });
  });

  it('returns 400 for invalid id parameter (too long)', async () => {
    const longId = 'a'.repeat(65);
    const res = await app.request(`/${longId}`);
    expect(res.status).toBe(400);
  });
});
