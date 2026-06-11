import { describe, it, expect, beforeEach } from 'vitest';
import type { EntityStore, BaseMemoryRepository } from '../repositories/base-memory';

describe('EntityStore', () => {
  let EntityStoreConstructor: new (namespace: string) => EntityStore;
  let store: EntityStore;

  beforeEach(async () => {
    const mod = await import('../repositories/base-memory');
    EntityStoreConstructor = mod.EntityStore;
    store = new EntityStoreConstructor('test');
  });

  it('upsert and get', () => {
    store.upsert({ id: '1', name: 'foo' });
    expect(store.get('1')?.name).toBe('foo');
  });

  it('get returns undefined for missing', () => {
    expect(store.get('nonexistent')).toBeUndefined();
  });

  it('remove returns true for existing', () => {
    store.upsert({ id: '1' });
    expect(store.remove('1')).toBe(true);
    expect(store.get('1')).toBeUndefined();
  });

  it('remove returns false for missing', () => {
    expect(store.remove('nonexistent')).toBe(false);
  });

  it('getAll returns all items', () => {
    store.upsert({ id: '1', name: 'a' });
    store.upsert({ id: '2', name: 'b' });
    expect(store.getAll()).toHaveLength(2);
  });

  it('getAll with filter', () => {
    store.upsert({ id: '1', name: 'a', active: true });
    store.upsert({ id: '2', name: 'b', active: false });
    const result = store.getAll({ where: { active: true } });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
  });

  it('clear removes all', () => {
    store.upsert({ id: '1' });
    store.clear();
    expect(store.getAll()).toHaveLength(0);
  });

  it('count returns correct number', () => {
    store.upsert({ id: '1' });
    store.upsert({ id: '2' });
    expect(store.count()).toBe(2);
  });

  it('exists returns true/false', () => {
    store.upsert({ id: '1' });
    expect(store.exists('1')).toBe(true);
    expect(store.exists('2')).toBe(false);
  });
});

describe('applyFilter', () => {
  it('filters by where clause', async () => {
    const { applyFilter } = await import('../repositories/base-memory');
    const items = [{ id: '1', role: 'admin' }, { id: '2', role: 'user' }];
    const result = applyFilter(items, { where: { role: 'admin' } });
    expect(result).toHaveLength(1);
  });

  it('sorts ascending', async () => {
    const { applyFilter } = await import('../repositories/base-memory');
    const items = [{ id: '1', name: 'z' }, { id: '2', name: 'a' }];
    const result = applyFilter(items, { orderBy: { name: 'asc' } });
    expect(result[0].name).toBe('a');
  });

  it('sorts descending', async () => {
    const { applyFilter } = await import('../repositories/base-memory');
    const items = [{ id: '1', name: 'a' }, { id: '2', name: 'z' }];
    const result = applyFilter(items, { orderBy: { name: 'desc' } });
    expect(result[0].name).toBe('z');
  });

  it('applies offset and limit', async () => {
    const { applyFilter } = await import('../repositories/base-memory');
    const items = [{ id: '1' }, { id: '2' }, { id: '3' }];
    const result = applyFilter(items, { offset: 1, limit: 1 });
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });
});

describe('BaseMemoryRepository', () => {
  let BaseMemoryRepositoryConstructor: new (
    store: EntityStore,
    tenantKey?: string,
  ) => BaseMemoryRepository<Record<string, unknown>>;
  let store: EntityStore;
  let repo: BaseMemoryRepository<Record<string, unknown>>;

  beforeEach(async () => {
    const mod = await import('../repositories/base-memory');
    BaseMemoryRepositoryConstructor = mod.BaseMemoryRepository;
    const ES = mod.EntityStore;
    store = new ES('test-repo');
    repo = new BaseMemoryRepositoryConstructor(store, 'company_id');
  });

  it('create and findById', async () => {
    const created = await repo.create({ name: 'test' });
    expect(created.id).toBeDefined();
    const found = await repo.findById(String(created.id));
    expect(found?.name).toBe('test');
  });

  it('create with custom id', async () => {
    const created = await repo.create({ id: 'custom-1', name: 'test' });
    expect(created.id).toBe('custom-1');
  });

  it('findMany returns all', async () => {
    await repo.create({ name: 'a' });
    await repo.create({ name: 'b' });
    const items = await repo.findMany();
    expect(items).toHaveLength(2);
  });

  it('update modifies and returns updated', async () => {
    const created = await repo.create({ name: 'old' });
    const updated = await repo.update(String(created.id), { name: 'new' });
    expect(updated?.name).toBe('new');
  });

  it('update returns null for missing', async () => {
    const result = await repo.update('nonexistent', { name: 'x' });
    expect(result).toBeNull();
  });

  it('remove returns true for existing', async () => {
    const created = await repo.create({ name: 'test' });
    expect(await repo.remove(String(created.id))).toBe(true);
    expect(await repo.findById(String(created.id))).toBeNull();
  });

  it('remove returns false for missing', async () => {
    expect(await repo.remove('nonexistent')).toBe(false);
  });

  it('count returns correct number', async () => {
    await repo.create({ name: 'a' });
    await repo.create({ name: 'b' });
    expect(await repo.count()).toBe(2);
  });

  it('exists returns true/false', async () => {
    const created = await repo.create({ name: 'test' });
    expect(await repo.exists(String(created.id))).toBe(true);
    expect(await repo.exists('nonexistent')).toBe(false);
  });

  it('snapshot and restore', async () => {
    await repo.create({ id: '1', name: 'snap' });
    const snap = repo.snapshot();
    store.clear();
    expect(await repo.findMany()).toHaveLength(0);
    repo.restore(snap);
    expect(await repo.findMany()).toHaveLength(1);
  });

  it('tenant filter isolates data', async () => {
    await repo.create({ name: 'tenant-a' }, 'tenant-1');
    await repo.create({ name: 'tenant-b' }, 'tenant-2');
    const itemsA = await repo.findMany({}, 'tenant-1');
    expect(itemsA).toHaveLength(1);
    expect(itemsA[0].name).toBe('tenant-a');
  });

  it('reset clears all', async () => {
    await repo.create({ name: 'x' });
    repo.reset();
    expect(await repo.findMany()).toHaveLength(0);
  });
});

describe('deterministicId', () => {
  it('generates consistent IDs', async () => {
    const { deterministicId, initRandom } = await import('../repositories/base-memory');
    initRandom(42);
    const id1 = deterministicId('users', 'john');
    const id2 = deterministicId('users', 'john');
    expect(id1).toBe(id2);
  });
});
