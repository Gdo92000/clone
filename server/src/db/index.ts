import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schemaModule from './schema';
import { resolveDbProvider, CAPABILITIES } from './provider';
import { setProvider, getProvider, getCapabilities } from './provider-selector';
import { createMemoryRegistry, clearAllMemoryStores, resetMemoryStore } from './registry-memory';
import type { EnvConfig } from '../config';
import type { DbProvider, RuntimeCapabilities } from './provider';

export type { DbProvider };

let _db: ReturnType<typeof drizzle> | null = null;
let _client: ReturnType<typeof postgres> | null = null;
let _memoryRegistry: ReturnType<typeof createMemoryRegistry> | null = null;

/** Indica se a conexão drizzle já foi inicializada. */
export let isDbInitialized = false;

/**
 * db — proxy que delega para a instância drizzle real (modo postgres)
 * ou retorna undefined (modo memory).
 *
 * Em modo memória, acessos a propriedades retornam undefined.
 * Rotas que usam db diretamente devem usar registry.repos no lugar.
 */
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop: string) {
    const provider = (() => { try { return getProvider(); } catch { return null; } })();
    if (provider === 'memory') {
      return undefined;
    }
    const instance = getOrCreateDatabase();
    return (instance as Record<string, unknown>)[prop];
  },
});

/** Expose provider utilities. */
export { getProvider, getCapabilities, setProvider, clearAllMemoryStores, resetMemoryStore };

/**
 * createDatabase(env) — fábrica centralizada de conexões.
 *
 * Inicializa e registra o provider no `provider-selector`.
 */
export function createDatabase(
  env: EnvConfig,
): {
  registry: ReturnType<typeof createMemoryRegistry> | ReturnType<typeof drizzle>;
  provider: DbProvider;
  capabilities: RuntimeCapabilities;
} {
  const provider = resolveDbProvider(env);

  if (provider === 'memory') {
    const capabilities = CAPABILITIES.memory;
    setProvider('memory', capabilities);

    // Cria registry memória; reusa instância existente se já foi criada
    _memoryRegistry ??= createMemoryRegistry(capabilities);
    isDbInitialized = true;
    return { registry: _memoryRegistry, provider: 'memory', capabilities };
  }

  if (!env.DATABASE_URL) {
    throw new Error('DATABASE_PROVIDER=postgres requiere DATABASE_URL definida');
  }

  _client ??= postgres(env.DATABASE_URL, { prepare: false });
  _db ??= drizzle(_client, { schema: schemaModule });
  isDbInitialized = true;
  const capabilities = CAPABILITIES.postgres;

  setProvider('postgres', capabilities);

  return { registry: _db, provider: 'postgres', capabilities };
}

/**
 * getOrCreateDatabase() — retorna a instância drizzle já inicializada.
 * Dispara erro explícito se createDatabase(env) ainda não foi chamado
 * e o provider não for memory.
 */
export function getOrCreateDatabase(): ReturnType<typeof drizzle> {
  try {
    const prov = getProvider();
    if (prov === 'memory') {
      throw new Error(
        'Banco em modo memory: use registry.repos em vez de db diretamente.',
      );
    }
  } catch {
    // provider não inicializado
  }
  if (!_db) {
    throw new Error(
      'Database não inicializado. Chame createDatabase(env) no bootstrap antes de acessar o banco.',
    );
  }
  return _db;
}

/**
 * getRegistry() — retorna o registry ativo (postgres drizzle ou memory registry).
 */
export function getRegistry(): ReturnType<typeof createMemoryRegistry> | ReturnType<typeof drizzle> {
  try {
    const prov = getProvider();
    if (prov === 'memory') {
      if (!_memoryRegistry) {
        throw new Error('Registry memória não inicializado. Chame createDatabase(env) primeiro.');
      }
      return _memoryRegistry;
    }
  } catch {
    // fallthrough
  }
  if (!_db) {
    throw new Error('Registry não inicializado. Chame createDatabase(env) primeiro.');
  }
  return _db;
}
