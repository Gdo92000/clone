import type { DbProvider, RuntimeCapabilities } from '../db/provider';
import { resolveDbProvider, CAPABILITIES } from '../db/provider';
import { setProvider, getProvider, getCapabilities } from '../db/provider-selector';
import { clearAllMemoryStores, resetMemoryStore } from '../db/registry-memory';
import type { createMemoryRegistry } from '../db/registry-memory';
import { startReplayRecorder, stopReplayRecorder } from '../replay/recorder';
import { initChaosRouter } from '../chaos/router';
import { startTelemetry, shutdownTelemetry } from '../telemetry/router';
import type { EnvConfig } from '../config';

/**
 * EnvironmentRuntime — resolve e inicializa todo o ambiente de runtime
 * com uma única chamada.
 *
 * Uso no bootstrap:
 * ```ts
 * const { provider, capabilities, registry } = await initRuntime(env);
 * ```
 */
export interface RuntimeResult {
  provider: DbProvider;
  capabilities: RuntimeCapabilities;
  registry: ReturnType<typeof createMemoryRegistry> | ReturnType<typeof drizzle>;
}

import type { drizzle } from 'drizzle-orm/postgres-js';

let _initialized = false;

/**
 * initRuntime — inicializa o ambiente completo baseado em EnvConfig.
 *
 * Provider resolution:
 *   NODE_ENV=test           → memory (ignora DATABASE_PROVIDER)
 *   DATABASE_PROVIDER=memory → memory (não precisa de DATABASE_URL)
 *   NODE_ENV=development   → postgres (precisa DATABASE_URL)
 *   NODE_ENV=production    → postgres (precisa de DATABASE_URL)
 *
 * Auto-bootstrap de acordo com capabilities:
 *   hasReplay=true          → startReplayRecorder()
 *   hasChaos=true           → initChaosRouter()
 *   hasTelemetry=true       → initTelemetry()
 *   hasOfflinePersistence=true  → (frontend: React Query persistence)
 *   hasSnapshot=true        → (ver registry-memory)
 */
export async function initRuntime(env: EnvConfig): Promise<RuntimeResult> {
  if (_initialized) {
    // Já inicializado — retorna estado atual
    const provider: DbProvider = getProvider();
    const capabilities: RuntimeCapabilities = getCapabilities();
    const registry = (globalThis as unknown as { __flux_registry__: RuntimeResult['registry'] }).__flux_registry__;
    return {
      provider,
      capabilities,
      registry,
    };
  }

  // ─── 1. Resolve provider ────────────────────────────────────────────────────
  const provider: DbProvider = resolveDbProvider(env);
  const capabilities: RuntimeCapabilities = CAPABILITIES[provider];
  setProvider(provider, capabilities);

  // ─── 2. Inicializa banco/registry ──────────────────────────────────────────
  const { createDatabase } = await import('../db');
  const { registry, provider: resolvedProvider } = createDatabase(env);

  // Guarda registry e capabilities em globalThis para acesso cross-module sem ciclos
  (globalThis as Record<string, unknown>)['__flux_registry__'] = registry;
  (globalThis as Record<string, unknown>)['__flux_capabilities__'] = capabilities;

  // ─── 3. Auto-bootstrap por capability ───────────────────────────────────────
  // hasReplay         → startReplayRecorder()   (recorder lê __flux_capabilities__)
  // hasChaos          → initChaosRouter()
  // hasTelemetry      → startTelemetry()         (SpanStore fallback store inicializado)
  if (capabilities.hasReplay) {
    startReplayRecorder();
  }

  if (capabilities.hasChaos) {
    initChaosRouter();
  }

  if (capabilities.hasTelemetry) {
    startTelemetry();
  }

  _initialized = true;

  return {
    provider: resolvedProvider,
    capabilities,
    registry,
  };
}

/**
 * shutdownRuntime — desliga todos os recursos inicializados por initRuntime.
 * Usado em testes (afterAll) ou graceful shutdown.
 */
export async function shutdownRuntime(): Promise<void> {
  _initialized = false;
  clearAllMemoryStores();
  resetMemoryStore('restaurants');
  stopReplayRecorder();
  try {
    await shutdownTelemetry();
  } catch {
    // ignore
  }
  delete (globalThis as Record<string, unknown>)['__flux_registry__'];
  delete (globalThis as Record<string, unknown>)['__flux_capabilities__'];
}

/**
 * isMemoryMode — atalho para checar provider atual.
 */
export function isMemoryMode(): boolean {
  try {
    return getProvider() === 'memory';
  } catch {
    return false;
  }
}
