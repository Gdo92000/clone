
/**
 * Generic filter applied at query time.
 * Each implementation maps this to its native query mechanism.
 */
export interface Filter<T = unknown> {
  where?: Partial<T>;
  limit?: number;
  offset?: number;
  orderBy?: Partial<T>;
}

/** Shape accepted by RepositoryPort.create */
export interface CreateDTO<_T = unknown> {
  [key: string]: unknown;
}

/** Shape accepted by RepositoryPort.update */
export interface UpdateDTO<_T = unknown> {
  [key: string]: unknown;
}

/**
 * RepositoryPort — única porta de acesso a dados.
 *
 * Rotas DEPENDEM desta interface, NUNCA de implementações concretas.
 * Trocar PostgreSQL por memória (ou qualquer outro provider) não altera
 * nenhuma rota.
 */
export interface RepositoryPort<
  TEntity = unknown,
  TFilter extends Filter<TEntity> = Filter<TEntity>,
  TCreate = CreateDTO<TEntity>,
  TUpdate = UpdateDTO<TEntity>,
> {
  /** Retorna todos os registros aplicando o filtro. */
  findMany(filter?: TFilter): Promise<TEntity[]>;

  /** Retorna um registro por id ou null. */
  findById(id: string): Promise<TEntity | null>;

  /** Retorna múltiplos registros por lista de ids na ordem fornecida. */
  findByIds(ids: string[]): Promise<TEntity[]>;

  /** Cria um novo registro. */
  create(data: TCreate): Promise<TEntity>;

  /** Atualiza parcialmente um registro por id. */
  update(id: string, data: TUpdate): Promise<TEntity | null>;

  /** Remove um registro por id. */
  remove(id: string): Promise<boolean>;

  /** Contagem de registros aplicando o filtro. */
  count(filter?: TFilter): Promise<number>;

  /** Verifica existência por id. */
  exists(id: string): Promise<boolean>;
}

/**
 * HealthPort — abstrai a verificação de saúde do banco.
 * Rotas de /health usam esta interface, não sabem se é PG ou memória.
 */
export interface HealthPort {
  check(): Promise<{ ok: boolean; latencyMs?: number; error?: string }>;
}
