import type { Coordinates } from '../../domain/geospatial/geodesy';
import type { ReverseGeocodeResult } from '../../providers/geocoding/IGeocodingProvider';
import { calculateDistance } from '../../domain/geospatial/geodesy';

interface NeighborhoodCorrection {
  center: Coordinates;
  radiusKm: number;
  neighborhood: string;
}

const CORRECTIONS: NeighborhoodCorrection[] = [
  {
    center: { latitude: -20.529978, longitude: -47.442344 },
    radiusKm: 1.5,
    neighborhood: 'Residencial São Gabriel',
  },
];

function normalizeForComparison(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function applyNeighborhoodCorrections(
  coordinates: Coordinates,
  result: ReverseGeocodeResult,
): ReverseGeocodeResult {
  for (const correction of CORRECTIONS) {
    const distance = calculateDistance(
      coordinates.latitude,
      coordinates.longitude,
      correction.center.latitude,
      correction.center.longitude,
    );

    if (distance <= correction.radiusKm) {
      const currentNeighborhood = result.neighborhood ?? '';
      const normalizedCurrent = normalizeForComparison(currentNeighborhood);
      const normalizedTarget = normalizeForComparison(correction.neighborhood);

      if (!normalizedCurrent.includes(normalizedTarget)) {
        const stateCode = result.stateCode ?? result.state.substring(0, 2).toUpperCase();
        const displayName = `${correction.neighborhood}\n${result.city} - ${stateCode}`;
        return {
          ...result,
          neighborhood: correction.neighborhood,
          displayName,
        };
      }
    }
  }

  return result;
}
