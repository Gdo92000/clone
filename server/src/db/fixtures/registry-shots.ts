/**
 * Registry Snapshotshots — captura e restaura estado completo dos stores de memória.
 *
 * Uso típico:
 *   snapshotRegistry(registry)            → antes do teste
 *   defaultSnapshot = { ... }             → modificar stores no teste
 *   restoreRegistry(registry, snapshot)   → afterEach teardown
 */

import type { Registry } from '../registry';
import type { DbProvider } from '../provider';

/** Chave do registry no globalThis (mesma usada por environmentRuntime.ts) */
const _REGISTRY_KEY = '__flux_registry__';

/**
 * Snapshot de um repositório individual — Map<string, TEntity[]>.
 */
export type RepoSnapshot<T = Record<string, unknown>> = {
  entityName: string;
  items: T[];
};

/**
 * RegistryShot — snapshots de todos os repositórios do registry.
 */
export type RegistryShot = {
  provider: DbProvider;
  timestamp: string;
  repos: RepoSnapshot[];
};

/**
 * snapshotRegistry — captura o estado completo de todos os repositórios.
 *
 * @param registry  Registry ativo (postgres drizzle postgres ou memória).
 * @returns RegistryShot com todos os dados serializáveis.
 */
export function snapshotRegistry(
  registry: Registry,
): Promise<RegistryShot> {
  const repos = registry.repos as Record<string, Record<string, unknown>[]>;

  const shots: RepoSnapshot[] = Object.entries(repos)
.map(([entityName, repo]) => {
  const entityArray = repo as unknown as { snapshot: () => Record<string, unknown>[]; };
  const items_fn = entityArray.snapshot;
  const items = typeof items_fn === 'function' ? items_fn() : [];
  return {
    entityName,
    items,
  };
});

  return {
    provider: registry.provider,
    timestamp: new Date().toISOString(),
    repos: shots,
  };
}

/**
 * restoreRegistry — restaura todos os repositórios a partir de um RegistryShot.
 *
 * Em modo postgres o snapshot é ignorado (não aplicável).
 *
 * @param registry Registry ativo.
 * @param shot     RegistryShot previamente capturado.
 * @returns Número de repositórios restaurados.
 */
export function restoreRegistry(
  registry: Registry,
  shot: RegistryShot,
): Promise<number> {
  if (registry.provider !== 'memory') {
    return 0;
  }

  const repos = registry.repos as Record<
    string,
    {
      restore?: (items: Record<string, unknown>[]) => void;
      reset?: () => void;
    }
  >;

  let restored = 0;

  for (const repoShot of shot.repos) {
    const repo = repos[repoShot.entityName];
  if (!repo.restore) continue;

  repo.reset?.();
  repo.restore(repoShot.items);
  restored++;
  }

  return restored;
}
