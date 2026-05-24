import type { DbProvider, RuntimeCapabilities } from './provider';
import { resolveDbProvider, CAPABILITIES } from './provider';
import { setProvider, getProvider, getCapabilities, clearAllMemoryStores, resetMemoryStore } from './provider-selector';
import { createMemoryRegistry } from './registry-memory';
import { startReplayRecorder, stopReplayRecorder } from '../replay/recorder';
import { initChaosRouter } from '../chaos/router';
import { startTelemetry, shutdownTelemetry } from '../telemetry/router';
import { healthz, liveness, readiness } from '../routes/health.runtime';
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
  registry: ReturnType<typeof createMemoryRegistry> | ReturnType<import('drizzle-orm').ReturnType<typeof import('drizzle-orm/postgres-js').drizzle>>;
}

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
    return {
      provider: getProvider(),
      capabilities: getCapabilities(),
      registry: (globalThis as Record<string, unknown>)['__flux_registry__'] as RuntimeResult['registry'],
    };
  }

  // ─── 1. Resolve provider ────────────────────────────────────────────────────
  const provider = resolveDbProvider(env);
  const capabilities = CAPABILITIES[provider];
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
    await startReplayRecorder();
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
  stopReplayRecorder().catch(() => { /* ignore */ });
  shutdownTelemetry().catch(() => { /* ignore */ });
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
