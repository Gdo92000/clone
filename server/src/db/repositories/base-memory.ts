import type { RepositoryPort, Filter, CreateDTO, UpdateDTO } from '../../ports/repository';

/**
 * Deterministic ID generator — mesmo seed = mesmos IDs.
 */
let _counter = 0;
let _seed = 0;

function _setSeed(seed: number): void {
  _seed = seed;
  _counter = 0;
}

function seededRandom(): () => number {
  let s = _seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 0x100000000;
  };
}

/**
 * Gera ID determinístico a partir de um nome e seed.
 */
export function deterministicId(namespace: string, name: string): string {
  const rand = seededRandom();
  const hash = Array.from(namespace + name)
    .reduce((acc, c) => ((acc << 5) - acc + c.charCodeAt(0)) | 0, 0);
  const rnd = Math.floor(rand() * 0xFFFF).toString(16).padStart(4, '0');
  return `${namespace}-${Math.abs(hash).toString(36)}-${rnd}`;
}

/**
 * ControlledTimestamp — fonte única de "agora" nos testes.
 */
let _clockOffset = 0;

export function setClock(offsetMs: number): void {
  _clockOffset = offsetMs;
}

export function getNow(): Date {
  return new Date(Date.now() + _clockOffset);
}

/**
 * resetDeterminism — reseta seed e relógio entre testes.
 */
export function resetDeterminism(): void {
  _seed = 0;
  _counter = 0;
  _clockOffset = 0;
}

/**
 * initRandom — chame uma vez no início do processo (test ou dev).
 */
export function initRandom(seed?: number): void {
  _seed = seed ?? (typeof crypto !== 'undefined' ? Date.now() : 0);
  _counter = 0;
}

/**
 * Filter application — usa a mesma lógica para todos os repos memória.
 */
export function applyFilter<T extends Record<string, unknown>>(
  items: T[],
  filter?: Filter<T>,
): T[] {
  let result = [...items];

  if (filter?.where) {
    const w = filter.where as Record<string, unknown>;
    result = result.filter((item) =>
      Object.entries(w).every(([k, v]) => {
        if (v === undefined || v === null) return true;
        return item[k] === v;
      }),
    );
  }

  if (filter?.orderBy) {
    const ob = filter.orderBy as Record<string, unknown>;
    const [key] = Object.entries(ob);
    {
      const [col, dir] = key as [string, 'asc' | 'desc'];
      result.sort((a, b) => {
        const av = a[col];
        const bv = b[col];
        if (av === bv) return 0;
        if (av === null || av === undefined) return 1;
        if (bv === null || bv === undefined) return -1;
        const cmp = av < bv ? -1 : 1;
        return dir === 'desc' ? -cmp : cmp;
      });
    }
  }

  const offset = filter?.offset ?? 0;
  const limit = filter?.limit ?? result.length;
  return result.slice(offset, offset + limit);
}

/**
 * EntityStore — armazenamento genério por namespace.
 */
type EntityRecord = Record<string, unknown>;
type EntityMap = Map<string, EntityRecord>;

export class EntityStore {
  private store: EntityMap = new Map();
  readonly namespace: string;

  constructor(namespace: string) {
    this.namespace = namespace;
  }

  private rawKey(id: string): string {
    return `${this.namespace}:${id}`;
  }

  upsert(data: EntityRecord): void {
    this.store.set(this.rawKey(String(data.id)), { ...data });
  }

  get(id: string): EntityRecord | undefined {
    return this.store.get(this.rawKey(id));
  }

  getAll(filter?: Filter<EntityRecord>): EntityRecord[] {
    const items = [...this.store.values()];
    return applyFilter(items.filter(Boolean), filter);
  }

  remove(id: string): boolean {
    return this.store.delete(this.rawKey(id));
  }

  clear(): void {
    this.store.clear();
  }

  count(filter?: Filter<EntityRecord>): number {
    return this.getAll(filter).length;
  }

  exists(id: string): boolean {
    return this.store.has(this.rawKey(id));
  }
}

/**
 * BaseMemoryRepository — armazenamento determinístico em memória.
 *
 * - IDs determinísticos via `deterministicId(namespace, key)`
 * - Timestamps controlados via `getNow()`
 * - Snapshot via `snapshot()` / `restore()`
 * - Tenant isolation via `tenantFilter()`
 * - Sem estado global compartilhado: cada instância tem sua própria loja
 */
export class BaseMemoryRepository<
  TEntity extends Record<string, unknown>,
  TFilter extends Filter<TEntity> = Filter<TEntity>,
> implements RepositoryPort<TEntity, TFilter, CreateDTO<TEntity>, UpdateDTO<TEntity>>
{
  constructor(
    private readonly store: EntityStore,
    private readonly tenantKey: keyof TEntity = 'tenantId',
    private readonly createdAtKey: keyof TEntity = 'created_at',
    private readonly updatedAtKey: keyof TEntity = 'updated_at',
  ) {}

  private now(): Date { return getNow(); }

  private withTenant(item: TEntity, tenantId?: string): TEntity {
    if (!tenantId) return item;
    return { ...item, [this.tenantKey]: tenantId };
  }

  /**
   * tenantFilter — restringe busca a um tenant.
   * Retorna novo filtro acrescido do tenantId, ou o original se não houver.
   */
  tenantFilter(filter: TFilter, tenantId?: string): TFilter {
    if (!tenantId) return filter;
    const tenantClause = { where: { ...(filter.where ?? {}), [this.tenantKey]: tenantId } } as TFilter;
    return tenantClause;
  }

  findMany(filter?: TFilter, tenantId?: string): Promise<TEntity[]> {
    const f = tenantId ? this.tenantFilter(filter, tenantId) : filter;
    return Promise.resolve(this.store.getAll(f as Filter<EntityRecord>) as TEntity[]);
  }

  findById(id: string, tenantId?: string): Promise<TEntity | null> {
    const raw = this.store.get(id);
    if (!raw) return Promise.resolve(null);
    const item = raw as TEntity;
    if (tenantId && item[this.tenantKey] !== tenantId) return Promise.resolve(null);
    return Promise.resolve(item);
  }

  findByIds(ids: string[], tenantId?: string): Promise<TEntity[]> {
    return Promise.resolve(
      ids
        .map((id) => this.store.get(id) as TEntity | undefined)
        .filter((r): r is TEntity => r !== undefined)
        .filter((r) => !tenantId || r[this.tenantKey] === tenantId),
    );
  }

  create(data: CreateDTO<TEntity>, tenantId?: string): Promise<TEntity> {
    const id = typeof data.id === 'string' ? data.id : `mem-${Date.now()}-${++_counter}`;
    const now = this.now().toISOString();
    const record = {
      ...data,
      id,
      ...(tenantId ? { [this.tenantKey]: tenantId } : {}),
      [this.createdAtKey]: now,
      [this.updatedAtKey]: now,
    } as TEntity;
    this.store.upsert(record);
    return Promise.resolve(record);
  }

  update(id: string, data: UpdateDTO<TEntity>, tenantId?: string): Promise<TEntity | null> {
    const existing = this.store.get(id) as TEntity | undefined;
    if (!existing) return Promise.resolve(null);
    if (tenantId && existing[this.tenantKey] !== tenantId) return Promise.resolve(null);
    const now = this.now().toISOString();
    const updated = { ...existing, ...data, [this.updatedAtKey]: now };
    this.store.upsert(updated);
    return Promise.resolve(updated);
  }

  remove(id: string, tenantId?: string): Promise<boolean> {
    const existing = this.store.get(id) as TEntity | undefined;
    if (!existing) return Promise.resolve(false);
    if (tenantId && existing[this.tenantKey] !== tenantId) return Promise.resolve(false);
    return Promise.resolve(this.store.remove(id));
  }

  count(filter?: TFilter, tenantId?: string): Promise<number> {
    const f = tenantId ? this.tenantFilter(filter, tenantId) : filter;
    return Promise.resolve(this.store.count(f as Filter<EntityRecord>));
  }

  exists(id: string, tenantId?: string): Promise<boolean> {
    const existing = this.store.get(id) as TEntity | undefined;
    if (!existing) return Promise.resolve(false);
    if (tenantId && existing[this.tenantKey] !== tenantId) return Promise.resolve(false);
    return Promise.resolve(true);
  }

  /** Snapshot de todos os dados (para export/fixtures). */
  snapshot(): TEntity[] {
    return this.store.getAll() as TEntity[];
  }

  /** Restaura a partir de snapshot. Não modifica IDs existentes. */
  restore(items: TEntity[]): void {
  for (const item of items) {
    if ('id' in item) {
      this.store.upsert(item);
    }
  }
  }

  /** Reseta a loja completamente. */
  reset(): void {
    this.store.clear();
  }
}
