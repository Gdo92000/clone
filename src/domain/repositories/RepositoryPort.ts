export interface RepositoryFilter<T = Record<string, unknown>> {
  where?: Partial<T>;
  limit?: number;
  offset?: number;
  orderBy?: Partial<Record<keyof T, 'asc' | 'desc'>>;
  includeDeleted?: boolean;
}

export interface RepositoryPort<
  TEntity,
  TFilter extends RepositoryFilter<TEntity> = RepositoryFilter<TEntity>,
  TCreate = Record<string, unknown>,
  TUpdate = Partial<TEntity>,
> {
  findMany(filter?: TFilter): Promise<TEntity[]>;
  findById(id: string, options?: { includeDeleted?: boolean }): Promise<TEntity | null>;
  findByIds(ids: string[], options?: { includeDeleted?: boolean }): Promise<TEntity[]>;
  create(data: TCreate): Promise<TEntity>;
  update(id: string, data: TUpdate): Promise<TEntity | null>;
  /**
   * Soft delete: marca o registro como removido (deletedAt) sem excluí-lo fisicamente.
   * @returns true se o registro existia e foi marcado; false caso contrário.
   */
  remove(id: string): Promise<boolean>;
  /**
   * Restaura um registro previamente marcado como removido.
   * Implementações podem delegar para o contrato herdado de `BaseMemoryRepository`/`PostgresRepository`.
   * @returns true se o registro existia (incluindo soft-deleteds) e foi restaurado; false caso contrário.
   */
  restore?(id: string): Promise<boolean>;
  count(filter?: TFilter): Promise<number>;
  exists(id: string, options?: { includeDeleted?: boolean }): Promise<boolean>;
}
