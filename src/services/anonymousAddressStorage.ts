import { storageService } from "../storage/storageService";
import type { Coordinates } from "../domain/geospatial/geodesy";
import { logger } from "../lib/logger";

/** Dados de localização persistidos para usuários anônimos */
export interface AnonymousAddress {
  coordinates: Coordinates;
  city: string;
  state: string;
  neighborhood?: string;
  formattedAddress?: string;
  source: "gps" | "manual";
  timestamp: number;
}

const STORAGE_KEY = "anonymous_location";
const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000; // 24h

/**
 * Persiste a localização do usuário anônimo em localStorage
 * com TTL configurável (padrão 24h).
 *
 * Separado do cache de geocoding para permitir TTLs e
 * políticas de expurgo diferentes.
 */
export const anonymousAddressStorage = {
  /** Salva localização anônima */
  save(data: Omit<AnonymousAddress, "timestamp">): void {
    const entry: AnonymousAddress = {
      ...data,
      timestamp: Date.now(),
    };
    storageService.set(STORAGE_KEY, entry);
    logger.info("AnonymousStorage", "Localização anônima salva", {
      city: data.city,
      source: data.source,
    });
  },

  /** Carrega localização anônima se dentro do TTL */
  load(ttlMs: number = DEFAULT_TTL_MS): AnonymousAddress | null {
    try {
      const data = storageService.get(STORAGE_KEY) as AnonymousAddress | null;
      if (!data) return null;

      const age = Date.now() - data.timestamp;
      if (age > ttlMs) {
        this.clear();
        return null;
      }

      return data;
    } catch {
      return null;
    }
  },

  /** Remove localização anônima */
  clear(): void {
    storageService.remove(STORAGE_KEY);
  },

  /** Verifica se existe localização anônima válida */
  exists(ttlMs: number = DEFAULT_TTL_MS): boolean {
    return this.load(ttlMs) !== null;
  },
};
