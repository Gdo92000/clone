import type { RepositoryPort, Filter, CreateDTO, UpdateDTO } from '../../ports/repository';
import { eq } from 'drizzle-orm';
import type { SQLWrapper } from 'drizzle-orm/sql/sql.js';

/**
 * DrizzleColumnMarker — marcador de tipo para `eq()`.
 *
 * drizzle-orm exige que o primeiro argumento de eq/ne/and/or seja um
 * `SQLWrapper` (que é implementado por `Column`).  Quando a tabela é
 * genérica (TTable extends Table) o compilador não sabe que `table.id` é
 * Column.  Esta interface serve apenas para que TypeScript aceite o cast.
 */
interface DrizzleColumnMarker extends SQLWrapper { _: { tableName: string } }

/** Pass-through query builder chain — evita tipar SelectQuery em cada overload. */
type RawQuery<T> = {
  (table: { _: { columns: Record<string, DrizzleColumnMarker> } }): Promise<T[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  whereIn: (col: string, ids: string[]) => Promise<T[]>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  then: (onfulfilled?: (value: T[]) => unknown) => unknown;
};

/**
 * PostgresRepository<TTable> — wrapper fino sobre drizzle-orm Postgres.
 *
 * Internamente usa a API direta do drizzle (select/insert/update/delete)
 * sem lógica de negócio, cache ou retry.
 *
 * Tipos de retorno são inferidos pelo drizzle a partir da tabela concreta
 * fornecida no construtor.  O desafio maior é o `eq()` — como a tabela
 * chega como parâmetro genérico, precisamos de um cast explícito para que
 * TypeScript aceite o Column como primeiro argumento.
 */
export class PostgresRepository<
  TTable extends { _: { columns: Record<string, DrizzleColumnMarker> } } = { _: { columns: Record<string, DrizzleColumnMarker> } },
> implements RepositoryPort
{
  constructor(
    /** Instância drizzle database. */
    private readonly _db: Parameters<typeof eq>[0]['db'],
    /** Tabela drizzle associada. */
    private readonly _table: TTable,
  ) {}

  // --- helpers internos ------------------------------------------------------

  /** Monta a query base: db.select().from(table) */
  private selectAll(): RawQuery<TTable['_']['columns'][string]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return this._db.select().from(this._table as any) as unknown as RawQuery<TTable['_']['columns'][string]>;
  }

  private get idColumn(): DrizzleColumnMarker {
    return this._table._.columns.id as DrizzleColumnMarker;
  }

  // --- RepositoryPort --------------------------------------------------------

  findMany(): Promise<TTable['_']['columns'][string][]> {
    return this.selectAll();
  }

  findById(id: string): Promise<TTable['_']['columns'][string] | null> {
    const rows = await this._db
      .select()
      .from(this._table as unknown as TTable['_']['columns'][string]['_']['table'])
      .where(eq(this.idColumn, id as typeof id & string))
      .limit(1);
    // @ts-expect-error drizzle returns typed row; guard via runtime length
    return (rows as TTable['_']['columns'][string][])[0] ?? null;
  }

  findByIds(ids: string[]): Promise<TTable['_']['columns'][string][]> {
    if (ids.length === 0) return Promise.resolve([]);
    return this._db
      .select()
      .from(this._table as unknown as TTable['_']['columns'][string]['_']['table'])
      .where(eq(this.idColumn, ids) as unknown as Parameters<typeof eq>[1])
      .limit(ids.length);
  }

  create(data: Record<string, unknown>): Promise<TTable['_']['columns'][string]> {
    const id = crypto.randomUUID();
    return this._db
      .insert(this._table as unknown as TTable['_']['columns'][string]['_']['table'])
      .values({ ...data, id })
      .returning()
      .then((rows: TTable['_']['columns'][string][]) => rows[0]);
  }

  update(id: string, data: Record<string, unknown>): Promise<TTable['_']['columns'][string] | null> {
    return this._db
      .update(this._table as unknown as TTable['_']['columns'][string]['_']['table'])
      .set(data)
      .where(eq(this.idColumn, id as typeof id & string))
      .returning()
      .then((rows: TTable['_']['columns'][string][]) => rows[0] ?? null);
  }

  remove(id: string): Promise<boolean> {
    return this._db
      .delete(this._table as unknown as TTable['_']['columns'][string]['_']['table'])
      .where(eq(this.idColumn, id as typeof id & string))
      .then(() => true as boolean);
  }

  count(): Promise<number> {
    return this.findMany().then(rows => rows.length);
  }

  exists(id: string): Promise<boolean> {
    return this.findById(id).then(Boolean);
  }

  // --- Transaction -----------------------------------------------------------

  withTransaction<T>(
    fn: (tx: Parameters<typeof this._db.transaction>[0]) => Promise<T>,
  ): Promise<T> {
    return this._db.transaction(fn);
  }
}
