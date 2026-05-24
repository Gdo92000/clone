/**
 * Registry Shots Tests — valida snapshotRegistry, restoreRegistry e loaders.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import { initRandom, deterministicId, getNow } from '../../db/repositories/base-memory';
import { loadFixture, readFixtureFile } from '../../db/fixtures/loader';
import { snapshotRegistry, snapshotRegistryJSON, restoreRegistry } from '../../db/fixtures/registry-shots';
import { createMemoryRegistry, clearAllMemoryStores } from '../../db/registry-memory';
import type { Registry } from '../../db/registry';

// ─── helpers ───────────────────────────────────────────────────────────────────

/**
 * Cria um Registry limpo em modo memória para cada suíte.
 * O RegistryBatch é criado dinamicamente para não tipar genericamente todo o `Repositories`.
 */
let registry: Registry;

beforeEach(async () => {
  initRandom(42);
  registry = createMemoryRegistry({
    hasSnapshot: true,
    hasTelemetry: false,
    hasReplay: false,
    hasChaos: false,
    hasOfflinePersistence: false,
  });
});

afterAll(() => {
  clearAllMemoryStores();
});

// ─── loadFixture ──────────────────────────────────────────────────────────────

describe('loadFixture', () => {
  it('loads items into matching repo in memory mode', async () => {
    const fixture = {
      coverageCities: [
        // Dados mínimos válidos para uma cidade
        {
          id: 'fixture-city-1',
          name: 'Fixtúria',
          state: 'FX',
          latitude: '-23.0',
          longitude: '-46.0',
          radius_km: 10,
          restaurant_count: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    };

    const loaded = await loadFixture(registry, fixture);
    expect(loaded).toBe(1);

    const count = await registry.repos.coverageCities.count();
    expect(count).toBe(1);
  });

  it('retorna 0 quando provider é postgres (silenciosamente)', async () => {
    const postgresRegistry = { ...registry, provider: 'postgres' as const };
    const loaded = await loadFixture(postgresRegistry, { cities: [] });
    expect(loaded).toBe(0);
  });

    it('lança erro em strict mode se chave não existe no registry', async () => {
      const fixture = { nonexistentEntity: [{ id: '1', fake: 'data' }] };
      // @ts-expect-error chave intencionalmente incorreta para teste
      await expect(loadFixture(registry, fixture, { strict: true }))
        .rejects
        .toThrow("'nonexistentEntity'");
    });

  it('não lança em modo não-strict se chave não existe', async () => {
    await expect(
      loadFixture(registry, { nonexistent: [] }),
    ).resolves.toBe(0);
  });

  it('limpa stores antes de carregar quando clearBefore=true', async () => {
    // Carrega primeiro
    await loadFixture(registry, {
      coverageCities: [
        {
          id: 'city-round1',
          name: 'Round 1',
          state: 'R1',
          latitude: '0',
          longitude: '0',
          radius_km: 5,
          restaurant_count: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    // Recarrega com clearBefore=true e dados diferentes
    await loadFixture(
      registry,
      {
        coverageCities: [
          {
            id: 'city-round2',
            name: 'Round 2',
            state: 'R2',
            latitude: '1',
            longitude: '1',
            radius_km: 7,
            restaurant_count: 0,
            is_active: true,
            created_at: '2025-01-01T00:00:00.000Z',
          },
        ],
      },
      { clearBefore: true },
    );

    const count = await registry.repos.coverageCities.count();
    expect(count).toBe(1);
    const items = await registry.repos.coverageCities.findMany();
    expect(items[0]?.id).toBe('city-round2');
  });

  it('accumula fixtures sem clearBefore', async () => {
    await loadFixture(registry, {
      coverageCities: [
        {
          id: deterministicId('coverageCities', 'batch-a-0'),
          name: 'Lote A',
          state: 'A',
          latitude: '0',
          longitude: '0',
          radius_km: 5,
          restaurant_count: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
        },
        {
          id: deterministicId('coverageCities', 'batch-a-1'),
          name: 'Lote A 2',
          state: 'A',
          latitude: '0',
          longitude: '0',
          radius_km: 5,
          restaurant_count: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    const countA = await registry.repos.coverageCities.count();

    await loadFixture(registry, {
      coverageCities: [
        {
          id: deterministicId('coverageCities', 'batch-b-0'),
          name: 'Lote B',
          state: 'B',
          latitude: '0',
          longitude: '0',
          radius_km: 5,
          restaurant_count: 0,
          is_active: true,
          created_at: '2025-01-01T00:00:00.000Z',
        },
      ],
    });

    const countB = await registry.repos.coverageCities.count();
    // 3 acumulado: 2 de batch-a + 1 de batch-b
    expect(countB).toBe(countA + 1);
  });
});
