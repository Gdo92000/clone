import type { Coordinates } from '../domain/geospatial/geodesy';
import { findRegisteredCityCoverage } from '../services/cityCoverageFallback';
import { calculateDistance } from '../domain/geospatial/geodesy';
import { getGeocodingService } from '../services/geocoding/GeocodingService';
import { logger } from '../lib/logger';

export type LocationStatus = 'IDLE' | 'REQUESTING' | 'SUCCESS' | 'FALLBACK_IP' | 'DENIED' | 'ERROR';

export type LocationSource = 'gps' | 'gps-fallback' | 'ip' | 'cache' | 'manual' | null;

export type CoordSource = 'gps' | 'gps-fallback' | 'ip_fallback' | 'manual' | 'cache' | 'reverse_geocode' | null;

export interface City {
  name: string;
  state: string;
  stateCode: string;
  country: string;
  displayName: string;
  neighborhood?: string;
  postcode?: string;
}

export interface LocationState {
  coordinates: Coordinates | null;
  city: City | null;
  isWithinSupportedCity: boolean;
  distanceToCityCenter: number | null;
  status: LocationStatus;
  loading: boolean;
  error: string | null;
  source: LocationSource;
  coord_source: CoordSource;
  coord_confidence: number | null;
}

export function initialLocationState(): LocationState {
  return {
    coordinates: null, city: null, isWithinSupportedCity: false,
    distanceToCityCenter: null, status: 'IDLE', loading: false,
    error: null, source: null, coord_source: null, coord_confidence: null,
  };
}

export function calculateCoordConfidence(accuracyMeters: number | undefined | null): number {
  if (accuracyMeters == null) return 0.50;
  if (accuracyMeters <= 50) return 0.95;
  if (accuracyMeters <= 200) return 0.80;
  if (accuracyMeters <= 500) return 0.60;
  return 0.30;
}

export async function locateCity(coords: Coordinates): Promise<{ city: City; source: 'gps' | 'gps-fallback' }> {
  const source: 'gps' | 'gps-fallback' = coords.accuracy !== undefined && coords.accuracy <= 1000 ? 'gps' : 'gps-fallback';

  const service = getGeocodingService();
  const result = await service.reverseGeocode(coords);
  if (!result) throw new Error('CIDADE_NAO_ENCONTRADA');

  const city: City = {
    name: result.city,
    state: result.stateCode ?? result.state,
    stateCode: result.stateCode ?? '',
    country: result.country ?? 'Brasil',
    displayName: result.displayName,
    ...(result.neighborhood ? { neighborhood: result.neighborhood } : {}),
    ...(result.postcode ? { postcode: result.postcode } : {}),
  };

  return { city, source };
}

export function processSupportedCity(
  detectedCity: City,
  coords: Coordinates | null,
  coordConfidence: number | null,
) {
  if (!coords || coordConfidence == null || coordConfidence < 0.6) {
    return { isWithinSupportedCity: false, distanceToCityCenter: null };
  }
  try {
    const supported = findRegisteredCityCoverage(detectedCity.name);
    if (supported) {
      const distance = calculateDistance(coords.latitude, coords.longitude, supported.latitude, supported.longitude);
      return { isWithinSupportedCity: distance <= supported.radiusKm, distanceToCityCenter: distance };
    }
  } catch (error) {
    logger.warn('Location', 'Erro ao verificar cidade suportada', { error: String(error) });
  }
  return { isWithinSupportedCity: false, distanceToCityCenter: null };
}