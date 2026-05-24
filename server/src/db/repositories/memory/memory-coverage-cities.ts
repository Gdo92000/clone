import { BaseMemoryRepository, EntityStore } from './base-memory';
import type { Filter, CreateDTO, UpdateDTO } from '../../ports/repository';

/** Shape mirroring drizzle coverageCities schema. */
export interface MemoryCoverageCityRow {
  id: string;
  name: string;
  state: string;
  latitude: string;
  longitude: string;
  radius_km: number;
  restaurant_count: number;
  is_active: boolean;
  created_at: string;
  tenantId?: string;
}

type MemoryCoverageCityFilter = Filter<MemoryCoverageCityRow>;

/**
 * MemoryCoverageCityRepository — repositório em memória para cidades de cobertura.
 */
export class MemoryCoverageCityRepository
  extends BaseMemoryRepository<MemoryCoverageCityRow, MemoryCoverageCityFilter>
{
  constructor() {
    super(new EntityStore('coverageCities'));
  }

  /** Busca cidade por nome normalizado (case-insensitive, sem acento). */
  async findByName(name: string): Promise<MemoryCoverageCityRow | null> {
    const all = this['store'].getAll() as MemoryCoverageCityRow[];
    const normalized = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    const match = all.find(
      (c) => c.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim() === normalized
    );
    return match ? Promise.resolve(match) : Promise.resolve(null);
  }

  /** Busca apenas cidades ativas. */
  async findActive(): Promise<MemoryCoverageCityRow[]> {
    const all = this['store'].getAll() as MemoryCoverageCityRow[];
    return Promise.resolve(all.filter((c) => c.is_active));
  }
}
