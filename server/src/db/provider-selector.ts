/**
 * provider-selector.ts — único ponto de verdade sobre qual DB está ativo.
 *
 * Outros módulos devem importar `currentProvider` e `currentCapabilities`
 * em vez de ler process.env diretamente.
 */
import type { DbProvider, RuntimeCapabilities } from './provider';

let _provider: DbProvider | null = null;
let _capabilities: RuntimeCapabilities | null = null;

export function setProvider(provider: DbProvider, capabilities?: RuntimeCapabilities): void {
  _provider = provider;
  if (capabilities) _capabilities = capabilities;
  // Espelha em globalThis para módulos que não podem importar este arquivo
  // (ex: telemetry, que importa telemetry que importa requestContext que importa provider).
  if (capabilities) {
    (globalThis as Record<string, unknown>)['__flux_capabilities__'] = capabilities;
  }
}

export function getProvider(): DbProvider {
  if (!_provider) {
    throw new Error(
      'Provider não inicializado. Chame setProvider() antes de acessar o banco de dados.',
    );
  }
  return _provider;
}

export function getCapabilities(): RuntimeCapabilities {
  if (!_capabilities) {
    throw new Error(
      'Capabilities não inicializadas. Chame setProvider() antes de acessar o banco de dados.',
    );
  }
  return _capabilities;
}

/** Versão não-lançante de getCapabilities — retorna null se não inicializado. */
export function getCapabilitiesSafe(): RuntimeCapabilities | null {
  return _capabilities;
}
