import type { EnvConfig } from '../config';

/**
 * Provider de banco de dados disponível.
 *
 * - 'postgres': conexão TCP real (produção e dev padrão).
 * - 'memory':   storage em memória (testes, staging mock).
 *
 * NUNCA usar 'memory' em produção — o factory falha com fail-fast explícito.
 */
export type DbProvider = 'postgres' | 'memory';

/**
 * RuntimeCapabilities — feature flags determinados pelo provider.
 */
export interface RuntimeCapabilities {
  hasTelemetry: boolean;
  hasReplay: boolean;
  hasChaos: boolean;
  hasOfflinePersistence: boolean;
  hasSnapshot: boolean;
}

/**
 * Capabilidades por provider.
 * PostgreSQL: todos suportados.
 * Memory: telemetria e replay não fazem sentido, os demais sim (usados em testes).
 */
export const CAPABILITIES: Record<DbProvider, RuntimeCapabilities> = {
  postgres: {
    hasTelemetry: true,
    hasReplay: false,
    hasChaos: false,
    hasOfflinePersistence: false,
    hasSnapshot: false,
  },
  memory: {
    hasTelemetry: false,
    hasReplay: true,
    hasChaos: true,
    hasOfflinePersistence: true,
    hasSnapshot: true,
  },
};

/**
 * Resolve o provider de banco de dados a partir do ambiente.
 *
 * Tabela de resolução:
 *   NODE_ENV=test          → 'memory'  (ignora DATABASE_PROVIDER)
 *   DATABASE_PROVIDER      → valor direto
 *   NODE_ENV=development   → 'postgres' (default)
 *   NODE_ENV=production    → 'postgres' (default)
 *
 * @param env Configuração de ambiente validada.
 * @returns 'postgres' | 'memory'
 */
export function resolveDbProvider(env: EnvConfig): DbProvider {
  if (env.NODE_ENV === 'test') {
    return 'memory';
  }
  if (env.DATABASE_URL === '__memory__' || env.DATABASE_URL === 'memory') {
    return 'memory';
  }
  return 'postgres';
}
