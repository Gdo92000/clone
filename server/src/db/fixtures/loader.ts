/**
 * Fixture Loader — carrega objetos de dados de teste nos stores de memória.
 *
 * Uso típico:
 *   await loadFixture(registry, { 'coverageCities': [...], 'plans': [...] });
 *
 * Projetos de convenção:
 *  - Um arquivo por entidade:   `coverage-cities.json`
 *  - Arquivo agregado:           `all.json` (todas as entidades)
 *  - Defaults para testes:       `defaults.json`
 */

import type { Registry } from '../registry';

// ─── tipos ───────────────────────────────────────────────────────────────────

/** Fixture é um objeto chave → array de entidades, chave = nome do repositório. */
export type FixtureData = Record<string, Record<string, unknown>[]>;

/** Opções do loader. */
export interface LoaderOptions {
  /** Se true, antes de carregar limpa todas as stores. */
  clearBefore?: boolean;
  /** Se true, valida que todas as chaves do fixture existem no registry. */
  strict?: boolean;
}

// ─── carregamento de dados ─────────────────────────────────────────────────────

/**
 * loadFixture — injeta dados de fixture no registry.
 *
 * Em modo postgres faz nada (fixture loading só aplica a memory).
 *
 * @param registry  Registry ativo.
 * @param data      Objeto chave → array de entidades.
 * @param opts      Opções de carregamento.
 * @returns Número de entidades carregadas.
 */
export function loadFixture(
  registry: Registry,
  data: FixtureData,
  opts: LoaderOptions = {},
): Promise<number> {
  return Promise.resolve().then(() => {
    if (registry.provider !== 'memory') return 0;

    const repos = registry.repos as unknown as Partial<Record<
      string,
      { restore?: (items: Record<string, unknown>[]) => void; reset?: () => void }
    >>;

    if (opts.clearBefore) {
      for (const repo of Object.values(repos)) {
        if (repo) {
          repo.reset?.();
        }
      }
    }

    let total = 0;

    for (const [entityName, items] of Object.entries(data)) {
      if (opts.strict && !(entityName in repos)) {
        throw new Error(
          `Fixture key '${entityName}' não existe no registry.`,
        );
      }

      const repo = repos[entityName];
      if (!repo) continue;
      if (!repo.restore) continue;

      repo.restore(items);
      total += items.length;
    }

    return total;
  });
}
