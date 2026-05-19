import type { Coordinates } from '../hooks/useGeolocation';

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

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';
const RATE_LIMIT_MS = 1100;

const BRAZIL_STATE_CODES: Record<string, string> = {
  'são paulo': 'SP',
  'sao paulo': 'SP',
  'rio de janeiro': 'RJ',
  'minas gerais': 'MG',
  'bahia': 'BA',
  'paraná': 'PR',
  'parana': 'PR',
  'rio grande do sul': 'RS',
  'pernambuco': 'PE',
  'ceará': 'CE',
  'ceara': 'CE',
  'pará': 'PA',
  'para': 'PA',
  'maranhão': 'MA',
  'maranhao': 'MA',
  'goiás': 'GO',
  'goias': 'GO',
  'espírito santo': 'ES',
  'espirito santo': 'ES',
  'paraíba': 'PB',
  'paraiba': 'PB',
  'santa catarina': 'SC',
  'mato grosso': 'MT',
  'mato grosso do sul': 'MS',
  'piauí': 'PI',
  'piaui': 'PI',
  'alagoas': 'AL',
  'distrito federal': 'DF',
  'sergipe': 'SE',
  'rondônia': 'RO',
  'rondonia': 'RO',
  'tocantins': 'TO',
  'acre': 'AC',
  'amapá': 'AP',
  'amapa': 'AP',
  'amazonas': 'AM',
  'roraima': 'RR',
};

let lastRequestTime = 0;

async function rateLimitedFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;

  if (timeSinceLastRequest < RATE_LIMIT_MS) {
    await new Promise((resolve) =>
      setTimeout(resolve, RATE_LIMIT_MS - timeSinceLastRequest)
    );
  }

  lastRequestTime = Date.now();
  return fetch(url);
}

export async function reverseGeocode(
  coordinates: Coordinates
): Promise<City | null> {
  const { latitude, longitude } = coordinates;
  const url = `${NOMINATIM_BASE_URL}/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1&zoom=18`;

try {
     const response = await rateLimitedFetch(url);

     if (!response.ok) {
       if (response.status === 429) {
         throw new LocationServiceError('RATE_LIMIT', 'Limite de requisições excedido. Tente novamente em alguns segundos.');
       }
       throw new LocationServiceError('API_ERROR', 'Erro ao consultar localização');
     }

     const data = await response.json() as { address?: Record<string, string | undefined>; display_name?: string };

     if (!data.address) {
       throw new LocationServiceError('NOT_FOUND', 'Localização não encontrada');
     }

     const a = data.address;

     // Prioridade de bairro: suburb > neighbourhood > quarter > city_district
     const neighborhood =
       a['suburb'] ??
       a['neighbourhood'] ??
       a['quarter'] ??
       a['city_district'] ??
       undefined;

     // Nome da cidade: city > town > village > municipality > county
     const cityName =
       a['city'] ??
       a['town'] ??
       a['village'] ??
       a['municipality'] ??
       a['county'] ??
       data.display_name?.split(',')[0] ??
       'Cidade Desconhecida';

     const stateName = a['state'] ?? 'Estado Desconhecido';
     const isoCode = a['ISO3166-2']?.split('-')[1] ?? '';
     const stateCode = isoCode || (BRAZIL_STATE_CODES[stateName.toLowerCase()] ?? '');
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
    throw new LocationServiceError('NETWORK_ERROR', 'Erro de conexão. Verifique sua internet.');
  }
}

export function isWithinCity(
  userCoords: Coordinates,
  cityCenter: { lat: number; lng: number },
  radiusKm: number
): boolean {
  const distance = calculateDistance(
    userCoords.latitude,
    userCoords.longitude,
    cityCenter.lat,
    cityCenter.lng
  );
  return distance <= radiusKm;
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


