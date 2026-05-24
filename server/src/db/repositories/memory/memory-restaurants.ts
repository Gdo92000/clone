import type { restaurants } from '../../schema';
import { BaseMemoryRepository, EntityStore } from './base-memory';
import type { Filter, CreateDTO, UpdateDTO } from '../../ports/repository';

/** Shape of a restaurant row as stored in memory. */
export interface MemoryRestaurantRow {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  cuisine: string;
  category_id: string | null;
  address: string;
  number: string | null;
  neighborhood: string | null;
  city: string;
  state: string;
  zip_code: string | null;
  phone: string | null;
  image_url: string | null;
  banner_url: string | null;
  delivery_fee: string | null;
  delivery_time: string | null;
  latitude: string | null;
  longitude: string | null;
  rating: string;
  review_count: number;
  is_featured: boolean;
  payment_methods: string | null;
  created_at: string;
  updated_at: string;
  tenantId?: string;
}

type MemoryRestaurantFilter = Filter<MemoryRestaurantRow>;

/** Normaliza núcleo ASCII de um nome de cidade (minúscula + remove acentos). */
function normalizeCityName(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

/** Compara dois nomes de cidade normalizandos — usado ao invés de `a.toLowerCase() === b.toLowerCase()`. */
function isSameCityName(a: string, b: string): boolean {
  return normalizeCityName(a) === normalizeCityName(b);
}

/**
 * MemoryRestaurantRepository — repositório em memória para restaurantes.
 *
 * Respeita o mesmo contrato que PostgresRepository mas opera em Map local.
 * Deterministic: IDs e timestamps são controlados.
 */
export class MemoryRestaurantRepository
  extends BaseMemoryRepository<MemoryRestaurantRow, MemoryRestaurantFilter>
{
  constructor() {
    super(new EntityStore('restaurants'));
  }

  /** Insere múltiplos restaurantes de uma vez (seed). */
  bulkInsert(items: MemoryRestaurantRow[]): void {
    for (const item of items) {
      this['store'].upsert(item);
    }
  }

  /** Busca por cidade, filtrando por raio de distância. */
  findByCityAndRadius(
    cityName: string,
    latitude: number,
    longitude: number,
    radiusKm: number,
  ): Promise<MemoryRestaurantRow[]> {
    const all = this['store'].getAll() as MemoryRestaurantRow[];
    return Promise.resolve(
      all.filter((r) => {
        if (!r.latitude || !r.longitude) return false;
        if (!isSameCityName(r.city, cityName)) return false;
        const R = 6371;
        const dLat = toRad(Number(r.latitude) - latitude);
        const dLon = toRad(Number(r.longitude) - longitude);
        const a = Math.sin(dLat / 2) ** 2 +
          Math.cos(toRad(latitude)) * Math.cos(toRad(Number(r.latitude))) *
          Math.sin(dLon / 2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c <= radiusKm;
      }),
    );
  }
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
