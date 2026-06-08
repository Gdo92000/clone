import type { RepositoryPort } from '../../ports/repository';
import { eq } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

interface DrizzleColumnMarker {
  _: { tableName: string };
}

type RawQuery<T> = {
  (table: { _: { columns: Record<string, DrizzleColumnMarker> } }): Promise<T[]>;
  whereIn: (col: string, ids: string[]) => Promise<T[]>;
  then: (onfulfilled?: (value: T[]) => unknown) => unknown;
};

export class PostgresRepository<
TTable extends { _: { columns: Record<string, DrizzleColumnMarker> } } = { _: { columns: Record<string, DrizzleColumnMarker> } },
> implements RepositoryPort
{
  private readonly _db: PostgresJsDatabase;
  private readonly _table: TTable;

  constructor(
    db: PostgresJsDatabase,
    table: TTable,
  ) {
    this._db = db;
    this._table = table;
  }

  private selectAll(): RawQuery<TTable['_']['columns'][string]> {
    return this._db.select().from(this._table);
  }

  private get idColumn(): DrizzleColumnMarker {
    return this._table._.columns.id;
  }

  findMany(): Promise<TTable['_']['columns'][string][]> {
    return this.selectAll();
  }

  findById(id: string): Promise<TTable['_']['columns'][string] | null> {
    const rows = this._db
      .select()
      .from(this._table)
      .where(eq(this.idColumn, id))
      .limit(1);
    return rows.then(r => r[0] ?? null);
  }

  findByIds(ids: string[]): Promise<TTable['_']['columns'][string][]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this._db
      .select()
      .from(this._table)
      .where(eq(this.idColumn, ids))
      .limit(ids.length);
  }

  create(data: Record<string, unknown>): Promise<TTable['_']['columns'][string]> {
    const id = crypto.randomUUID();
    return this._db
      .insert(this._table)
      .values({ ...data, id })
      .returning()
      .then(rows => rows[0]);
  }

  update(id: string, data: Record<string, unknown>): Promise<TTable['_']['columns'][string] | null> {
    return this._db
      .update(this._table)
      .set(data)
      .where(eq(this.idColumn, id))
      .returning()
      .then(rows => rows[0] ?? null);
  }

  remove(id: string): Promise<boolean> {
    return this._db
      .delete(this._table)
      .where(eq(this.idColumn, id))
      .then(() => true);
  }

  count(): Promise<number> {
    return this.findMany().then(rows => rows.length);
  }

  exists(id: string): Promise<boolean> {
    return this.findById(id).then(Boolean);
  }

  withTransaction<T>(
    fn: (tx: Parameters<PostgresJsDatabase['transaction']>[0]) => Promise<T>,
  ): Promise<T> {
    return this._db.transaction(fn);
  }
}
