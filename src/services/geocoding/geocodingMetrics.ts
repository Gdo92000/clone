interface MetricEntry {
  count: number;
  totalLatencyMs: number;
}

interface GeocodingMetricsData {
  reverseGeocode: MetricEntry;
  forwardGeocode: MetricEntry;
  cacheHits: number;
  cacheMisses: number;
  retries: number;
  fallbacks: number;
  errors: Record<string, number>;
  viacepHits: number;
  viacepMisses: number;
  viacepDivergences: number;
  viacepLookupByAddress: number;
}

const metrics: GeocodingMetricsData = {
  reverseGeocode: { count: 0, totalLatencyMs: 0 },
  forwardGeocode: { count: 0, totalLatencyMs: 0 },
  cacheHits: 0,
  cacheMisses: 0,
  retries: 0,
  fallbacks: 0,
  errors: {},
  viacepHits: 0,
  viacepMisses: 0,
  viacepDivergences: 0,
  viacepLookupByAddress: 0,
};

export function recordReverseGeocode(latencyMs: number): void {
  metrics.reverseGeocode.count++;
  metrics.reverseGeocode.totalLatencyMs += latencyMs;
}

export function recordForwardGeocode(latencyMs: number): void {
  metrics.forwardGeocode.count++;
  metrics.forwardGeocode.totalLatencyMs += latencyMs;
}

export function recordCacheHit(): void {
  metrics.cacheHits++;
}

export function recordCacheMiss(): void {
  metrics.cacheMisses++;
}

export function recordRetry(): void {
  metrics.retries++;
}

export function recordFallback(): void {
  metrics.fallbacks++;
}

export function recordViaCepHit(): void {
  metrics.viacepHits++;
}

export function recordViaCepMiss(): void {
  metrics.viacepMisses++;
}

export function recordViaCepDivergence(): void {
  metrics.viacepDivergences++;
}

export function recordViaCepLookupByAddress(): void {
  metrics.viacepLookupByAddress++;
}

export function recordError(code: string): void {
  metrics.errors[code] = (metrics.errors[code] ?? 0) + 1;
}

export function getGeocodingMetrics(): GeocodingMetricsData & {
  reverseGeocodeAvgLatencyMs: number;
  forwardGeocodeAvgLatencyMs: number;
} {
  return {
    ...metrics,
    reverseGeocodeAvgLatencyMs:
      metrics.reverseGeocode.count > 0
        ? metrics.reverseGeocode.totalLatencyMs / metrics.reverseGeocode.count
        : 0,
    forwardGeocodeAvgLatencyMs:
      metrics.forwardGeocode.count > 0
        ? metrics.forwardGeocode.totalLatencyMs / metrics.forwardGeocode.count
        : 0,
  };
}

export function resetMetrics(): void {
  metrics.reverseGeocode = { count: 0, totalLatencyMs: 0 };
  metrics.forwardGeocode = { count: 0, totalLatencyMs: 0 };
  metrics.cacheHits = 0;
  metrics.cacheMisses = 0;
  metrics.retries = 0;
  metrics.fallbacks = 0;
  metrics.viacepHits = 0;
  metrics.viacepMisses = 0;
  metrics.viacepDivergences = 0;
  metrics.viacepLookupByAddress = 0;
  metrics.errors = {};
}
