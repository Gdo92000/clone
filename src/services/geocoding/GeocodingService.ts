import type { Coordinates } from "@/domain/geospatial/geodesy";
import type {
  IGeocodingProvider,
  ReverseGeocodeResult,
  ForwardGeocodeResult,
} from "@/providers/geocoding";
import { GeocodingError, getGeocodingProvider } from "@/providers/geocoding";
import { applyNeighborhoodCorrections } from "./neighborhoodCorrections";
import { enrichWithViaCep } from "./viacepEnricher";
import {
  recordReverseGeocode,
  recordForwardGeocode,
  recordCacheHit,
  recordCacheMiss,
  recordError,
} from "./geocodingMetrics";

const CACHE_TTL = 24 * 60 * 60 * 1000;
const LEGACY_COORDINATES_CACHE_KEY = "geocoding_cache_v1";
const COORDINATES_CACHE_KEY = "geocoding_cache_v4"; // v4: suporta ViaCEP enrichment
const LEGACY_V3_CACHE_KEY = "geocoding_cache_v3";

interface CacheEntry {
  result: ReverseGeocodeResult;
  timestamp: number;
  viacepChecked?: boolean;
}

export class GeocodingService {
  private provider: IGeocodingProvider;
  private cache: Map<string, CacheEntry> = new Map();
  private lastRequestTime = 0;
  private readonly MIN_REQUEST_INTERVAL = 1100;

  constructor(provider?: IGeocodingProvider) {
    this.provider = provider ?? getGeocodingProvider();
    this.loadCache();
  }

  async reverseGeocode(
    coordinates: Coordinates,
  ): Promise<ReverseGeocodeResult | null> {
    const key = this.makeCacheKey(coordinates);
    const cached = this.cache.get(key);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      if (cached.viacepChecked || !cached.result.postcode) {
        recordCacheHit();
        return cached.result;
      }
    }

    recordCacheMiss();
    await this.throttle();

    const start = performance.now();
    try {
      const result = await this.provider.reverseGeocode(coordinates);
      recordReverseGeocode(performance.now() - start);
      if (result) {
        const corrected = applyNeighborhoodCorrections(coordinates, result);
        const enriched = await enrichWithViaCep(corrected);
        this.cache.set(key, { result: enriched, timestamp: Date.now(), viacepChecked: true });
        this.persistCache();
        return enriched;
      }
      return null;
    } catch (error) {
      recordReverseGeocode(performance.now() - start);
      if (error instanceof GeocodingError) {
        recordError(error.code);
        throw error;
      }
      recordError("UNKNOWN");
      throw new GeocodingError(
        error instanceof Error ? error.message : "Unknown",
        "UNKNOWN",
        this.provider.name,
      );
    }
  }

  async forwardGeocode(query: string): Promise<ForwardGeocodeResult | null> {
    await this.throttle();
    const start = performance.now();
    try {
      const result = await this.provider.forwardGeocode(query);
      recordForwardGeocode(performance.now() - start);
      return result;
    } catch (error) {
      recordForwardGeocode(performance.now() - start);
      if (error instanceof GeocodingError) {
        recordError(error.code);
        throw error;
      }
      recordError("UNKNOWN");
      throw new GeocodingError(
        error instanceof Error ? error.message : "Unknown",
        "UNKNOWN",
        this.provider.name,
      );
    }
  }

  clearCache(): void {
    this.cache.clear();
    localStorage.removeItem(LEGACY_COORDINATES_CACHE_KEY);
    localStorage.removeItem(LEGACY_V3_CACHE_KEY);
    localStorage.removeItem(COORDINATES_CACHE_KEY);
  }

  private makeCacheKey(coordinates: Coordinates): string {
    const lat = Math.round(coordinates.latitude * 1e8) / 1e8;
    const lng = Math.round(coordinates.longitude * 1e8) / 1e8;
    return `${lat.toFixed(8)},${lng.toFixed(8)}`;
  }

  private throttle(): Promise<void> {
    return new Promise((resolve) => {
      const now = Date.now();
      const elapsed = now - this.lastRequestTime;
      if (elapsed < this.MIN_REQUEST_INTERVAL) {
        setTimeout(resolve, this.MIN_REQUEST_INTERVAL - elapsed);
      } else {
        this.lastRequestTime = now;
        resolve();
      }
    });
  }

  private loadCache(): void {
    try {
      const raw = localStorage.getItem(COORDINATES_CACHE_KEY);
      if (raw) {
        const data = JSON.parse(raw) as Record<string, CacheEntry>;
        this.cache = new Map(Object.entries(data));
        return;
      }
    } catch {
      // v4 cache invalid, try migrate from v3
    }
    try {
      const rawV3 = localStorage.getItem(LEGACY_V3_CACHE_KEY);
      if (rawV3) {
        const data = JSON.parse(rawV3) as Record<string, { result: ReverseGeocodeResult; timestamp: number }>;
        const migrated: Record<string, CacheEntry> = {};
        for (const [key, entry] of Object.entries(data)) {
          migrated[key] = { ...entry, viacepChecked: false };
        }
        this.cache = new Map(Object.entries(migrated));
        localStorage.removeItem(LEGACY_V3_CACHE_KEY);
        this.persistCache();
      }
    } catch {
      // v3 cache invalid, ignore
    }
  }

  private persistCache(): void {
    try {
      const obj: Record<string, CacheEntry> = {};
      for (const [key, entry] of this.cache.entries()) {
        obj[key] = entry;
      }
      localStorage.setItem(COORDINATES_CACHE_KEY, JSON.stringify(obj));
    } catch {
      // localStorage indisponível, ignorar
    }
  }
}

let geocodingServiceInstance: GeocodingService | null = null;

export function getGeocodingService(): GeocodingService {
  if (!geocodingServiceInstance) {
    geocodingServiceInstance = new GeocodingService();
  }
  return geocodingServiceInstance;
}
