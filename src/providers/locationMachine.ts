import type { Coordinates } from '../domain/geospatial/geodesy';
import { findRegisteredCityCoverage } from '../services/cityCoverageService';
import { calculateDistance } from '../domain/geospatial/geodesy';
import { getGeocodingService } from '../services/geocoding/GeocodingService';
import { logger } from '../lib/logger';

export type LocationStatus = 'IDLE' | 'REQUESTING' | 'SUCCESS' | 'FALLBACK_IP' | 'DENIED' | 'ERROR';

export type LocationSource = 'gps' | 'gps-fallback' | 'ip' | 'cache' | 'manual' | null;

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
}

export function initialLocationState(): LocationState {
  return {
    coordinates: null, city: null, isWithinSupportedCity: false,
    distanceToCityCenter: null, status: 'IDLE', loading: false,
    error: null, source: null,
  };
}

export async function locateCity(coords: Coordinates): Promise<{ city: City; source: 'gps' | 'gps-fallback' }> {
  const source: 'gps' | 'gps-fallback' = coords.accuracy !== undefined && coords.accuracy <= 1000 ? 'gps' : 'gps-fallback';

  const service = getGeocodingService();
  const result = await service.reverseGeocode(coords);
  if (!result) throw new Error('CIDADE_NAO_ENCONTRADA');

  const city: City = {
    name: result.city,
    state: result.state,
    stateCode: result.stateCode ?? '',
    country: result.country ?? 'Brasil',
    displayName: result.displayName,
    ...(result.neighborhood ? { neighborhood: result.neighborhood } : {}),
    ...(result.postcode ? { postcode: result.postcode } : {}),
  };

  return { city, source };
}

export async function processSupportedCity(detectedCity: City, coords: Coordinates) {
  try {
    const supported = await findRegisteredCityCoverage(detectedCity.name);
    if (supported) {
      const distance = calculateDistance(coords.latitude, coords.longitude, supported.lat, supported.lng);
      return { isWithinSupportedCity: distance <= supported.radiusKm, distanceToCityCenter: distance };
    }
  } catch (error) {
    logger.warn('Location', 'Erro ao verificar cidade suportada', { error: String(error) });
  }
  return { isWithinSupportedCity: false, distanceToCityCenter: null };
}