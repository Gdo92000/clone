import type { Coordinates } from '../types/location';
import { findRegisteredCityCoverage } from '../services/cityCoverageService';
import { calculateDistance, reverseGeocode } from '../services/locationService';
import type { City } from '../services/locationService';
import { logger } from '../lib/logger';

export type LocationStatus = 'IDLE' | 'REQUESTING' | 'SUCCESS' | 'FALLBACK_IP' | 'DENIED' | 'ERROR';

export type LocationSource = 'gps' | 'gps-fallback' | 'ip' | 'cache' | 'manual' | null;

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

  const detectedCity = await reverseGeocode(coords);
  if (!detectedCity) throw new Error('CIDADE_NAO_ENCONTRADA');

  return { city: detectedCity, source };
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