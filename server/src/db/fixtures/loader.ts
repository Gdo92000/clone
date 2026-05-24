/**
 * Fixture Loader — carrega arquivos JSON de dados de teste nos stores de memória.
 *
 * Uso típico:
 *   await loadFixture(registry, loadSync('./fixtures/coverage-cities.json'));
 *   await loadFixture(registry, { 'coverageCities': [...], 'plans': [...] });
 *
 * Projetos de convenção:
 *  - Um arquivo por entidade:   `coverage-cities.json`
 *  - Arquivo agregado:           `all.json` (todas as entidades)
 *  - Defaults para testes:       `defaults.json`
 */

import fs from 'node:fs/promises';
import path from 'node:path';

import type { Registry } from '../registry';
import { RegistryShot, parseRegistryShot, snapshotRegistryJSON } from './registry-shots';

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

// ─── leitura de arquivo ────────────────────────────────────────────────────────

/**
 * readFixtureFile — lê um arquivo JSON do disco e retorna FixtureData.
 */
export async function readFixtureFile(filePath: string): Promise<FixtureData> {
  const content = await fs.readFile(filePath, 'utf-8');
  return JSON.parse(content) as FixtureData;
}

/**
 * writeSnapshotFile — grava snapshot do registry em arquivo JSON.
 */
export async function writeSnapshotFile(
  filePath: string,
  shot: RegistryShot,
): Promise<void> {
  const dir = path.dirname(filePath);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(filePath, snapshotRegistryJSON(shot), 'utf-8');
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
export async function loadFixture(
  registry: Registry,
  data: FixtureData,
  opts: LoaderOptions = {},
): Promise<number> {
  if (registry.provider !== 'memory') return 0;

  const repos = registry.repos as Record<
    string,
    { restore?: (items: Record<string, unknown>[]) => void; reset?: () => void }
  >;

  if (opts.clearBefore) {
    for (const repo of Object.values(repos)) {
      repo.reset?.();
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
    if (!repo || !repo.restore) continue;

    repo.restore(items);
    total += items.length;
  }

  return total;
}

/**
 * loadDefaultFixture — combina leitura de arquivo + carregamento em uma chamada.
 */
export async function loadDefaultFixture(
  registry: Registry,
  filePath: string,
  opts: LoaderOptions = {},
): Promise<number> {
  const data = await readFixtureFile(filePath);
  return loadFixture(registry, data, opts);
}
