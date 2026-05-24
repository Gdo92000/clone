/**
 * TransactionPort — abstrai operações transacionais.
 *
 * Implementações:
 * - PostgresTransactionAdapter: delega para drizzle transaction
 * - MemoryTransactionAdapter:  simula commit/rollback em memória
 */
export interface TransactionPort {
  /** Retorna a transação subjacente (drizzle tx ou equivalente). */
  getTransaction(): Promise<unknown>;

  /** Confirma todas as operações pendentes. */
  commit(): Promise<void>;

  /** Desfaz todas as operações pendentes, mantendo o estado anterior. */
  rollback(error: unknown): Promise<void>;
}
