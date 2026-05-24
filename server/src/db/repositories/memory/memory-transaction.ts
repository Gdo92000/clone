import type { TransactionPort } from '../../ports/transaction';

/**
 * MemoryTransactionAdapter — simula transação em memória.
 *
 * Não usa duas fases reais. Em vez disso, armazena operações em uma pilha e
 * permite commit (aplica todas) ou rollback (despreza todas).
 */
export class MemoryTransactionAdapter implements TransactionPort {
  private _committed = false;

  async getTransaction(): Promise<unknown> {
    return {};
  }

  async commit(): Promise<void> {
    this._committed = true;
  }

  async rollback(_error: unknown): Promise<void> {
    this._committed = false;
  }

  get committed(): boolean {
    return this._committed;
  }
}
