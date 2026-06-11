import type { RepositoryPort } from '../../ports/repository';
import { eq } from 'drizzle-orm';
import type { PgTable } from 'drizzle-orm/pg-core';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type Db = PostgresJsDatabase<Record<string, unknown>>;

export class PostgresRepository implements RepositoryPort<Record<string, unknown>> {
  private readonly _db: Db;
  private readonly _table: PgTable;

  constructor(
    db: Db,
    table: PgTable,
  ) {
    this._db = db;
    this._table = table;
  }

  async findMany(): Promise<Record<string, unknown>[]> {
    return this._db.select().from(this._table);
  }

  async findById(id: string): Promise<Record<string, unknown> | null> {
    const rows: Record<string, unknown>[] = await this._db
      .select()
      .from(this._table)
      .where(eq(this._table._.columns.id, id))
      .limit(1);
    return rows[0] ?? null;
  }

  async findByIds(ids: string[]): Promise<Record<string, unknown>[]> {
    if (ids.length === 0) return [];
    return this._db
      .select()
      .from(this._table)
      .where(eq(this._table._.columns.id, ids))
      .limit(ids.length);
  }

  async create(data: Record<string, unknown>): Promise<Record<string, unknown>> {
    const id = crypto.randomUUID();
    const rows: Record<string, unknown>[] = await this._db
      .insert(this._table)
      .values({ ...data, id })
      .returning();
    return rows[0];
  }

  async update(id: string, data: Record<string, unknown>): Promise<Record<string, unknown> | null> {
    const rows: Record<string, unknown>[] = await this._db
      .update(this._table)
      .set(data)
      .where(eq(this._table._.columns.id, id))
      .returning();
    return rows[0] ?? null;
  }

  async remove(id: string): Promise<boolean> {
    await this._db
      .delete(this._table)
      .where(eq(this._table._.columns.id, id));
    return true;
  }

  async count(): Promise<number> {
    const rows = await this.findMany();
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }
}