import type { Coordinates } from '../types/location';
import { nominatimApi } from '../api/nominatimApi';
import { ApiError } from '../api';
import { normalizeState } from '../lib/brazilStates';

export interface City {
  name: string;
  state: string;
  stateCode: string;
  country: string;
  displayName: string;
  neighborhood?: string;
}

export class LocationServiceError extends Error {
  override name = 'LocationServiceError';
  code: 'API_ERROR' | 'RATE_LIMIT' | 'NOT_FOUND' | 'NETWORK_ERROR';

  constructor(code: LocationServiceError['code'], message: string) {
    super(message);
    this.code = code;
  }
}

const RATE_LIMIT_MS = 1100;

let lastRequestTime = 0;

async function rateLimitedNominatimReverse(lat: number, lon: number) {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  return nominatimApi.reverse(lat, lon);
}

export async function reverseGeocode(
  coordinates: Coordinates
): Promise<City | null> {
  const { latitude, longitude } = coordinates;

 try {
     const data = await rateLimitedNominatimReverse(latitude, longitude);

     if (!data?.address) {
       throw new LocationServiceError('NOT_FOUND', 'Localização não encontrada');
     }

     const a = data.address;

     const neighborhood =
       a['suburb'] ??
       a['neighbourhood'] ??
       a['quarter'] ??
       a['city_district'] ??
       undefined;

     const cityName =
       a['city'] ??
       a['town'] ??
       a['village'] ??
       a['municipality'] ??
       a['county'] ??
       data.display_name.split(',')[0] ??
       'Cidade Desconhecida';

     const stateName = a['state'] ?? 'Estado Desconhecido';
     const isoCode = a['ISO3166-2']?.split('-')[1] ?? '';
     const stateCode = isoCode || normalizeState(stateName);
     const country = a['country'] ?? 'Brasil';

     const displayName = neighborhood
        ? `${neighborhood}\n${cityName} - ${stateCode || stateName}`
        : `${cityName} - ${stateCode || stateName}`;

     const result: City = {
        name: cityName,
        state: stateName,
        stateCode,
        country,
        displayName,
      };
      if (neighborhood) result.neighborhood = neighborhood;
      return result;
   } catch (error) {
     if (error instanceof LocationServiceError) {
       throw error;
     }
     if (error instanceof ApiError) {
       if (error.status === 0) {
         throw new LocationServiceError('NETWORK_ERROR', 'Erro de conexão. Verifique sua internet.');
       }
       if (error.status === 429) {
         throw new LocationServiceError('RATE_LIMIT', 'Limite de requisições excedido. Tente novamente em alguns segundos.');
       }
       throw new LocationServiceError('API_ERROR', 'Erro ao consultar localização');
     }
     throw new LocationServiceError('NETWORK_ERROR', 'Erro de conexão. Verifique sua internet.');
   }
}

export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}


