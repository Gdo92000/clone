import type { Coordinates } from '../hooks/useGeolocation';
import { type RegisteredCityCoverage } from './cityCoverageService';
import { calculateDistance } from './locationService';

export type SupportedCity = RegisteredCityCoverage;

export interface Establishment {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  source: 'openstreetmap' | 'local';
}

interface OverpassElement {
  type: 'node' | 'way' | 'relation';
  id: number;
  lat?: number;
  lon?: number;
  center?: {
    lat: number;
    lon: number;
  };
  tags?: Record<string, string>;
}

interface OverpassResponse {
  elements: OverpassElement[];
}

export interface FetchEstablishmentsOptions {
  userCoordinates: Coordinates;
  city: SupportedCity;
  radiusKm: number;
  limit?: number;
}

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const OVERPASS_TIMEOUT_SECONDS = 18;
const MAX_QUERY_RADIUS_METERS = 12000;

const categoryLabels: Record<string, string> = {
  restaurant: 'Restaurante',
  cafe: 'Cafe',
  fast_food: 'Fast food',
  food_court: 'Praca de alimentacao',
  bar: 'Bar',
  pub: 'Pub',
  ice_cream: 'Sorveteria',
};

function normalizeText(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

function buildAddress(tags: Record<string, string>): string | null {
  const street = tags['addr:street'];
  const number = tags['addr:housenumber'];
  const district = tags['addr:suburb'] ?? tags['addr:neighbourhood'];

  const streetLine = street && number ? `${street}, ${number}` : street ?? null;
  const parts = [streetLine, district].filter(Boolean);

  return parts.length > 0 ? parts.join(' - ') : null;
}

function getElementCoordinates(
  element: OverpassElement
): { latitude: number; longitude: number } | null {
  if (typeof element.lat === 'number' && typeof element.lon === 'number') {
    return {
      latitude: element.lat,
      longitude: element.lon,
    };
  }

  if (element.center) {
    return {
      latitude: element.center.lat,
      longitude: element.center.lon,
    };
  }

  return null;
}

function hasCompatibleCityTag(
  tags: Record<string, string>,
  supportedCity: SupportedCity
): boolean {
  const taggedCity = tags['addr:city'] ?? tags['is_in:city'] ?? tags['addr:municipality'];

  if (!taggedCity) {
    return true;
  }

  return normalizeText(taggedCity) === normalizeText(supportedCity.name);
}

function toEstablishment(
  element: OverpassElement,
  userCoordinates: Coordinates,
  supportedCity: SupportedCity,
  radiusKm: number
): Establishment | null {
  const tags = element.tags;
  const coordinates = getElementCoordinates(element);

  if (!tags || !coordinates || !tags['name'] || !tags['amenity']) {
    return null;
  }

  if (!categoryLabels[tags['amenity']]) {
    return null;
  }

  if (!hasCompatibleCityTag(tags, supportedCity)) {
    return null;
  }

  const distanceKm = calculateDistance(
    userCoordinates.latitude,
    userCoordinates.longitude,
    coordinates.latitude,
    coordinates.longitude
  );

  if (distanceKm > radiusKm) {
    return null;
  }

  const distanceToCityCenter = calculateDistance(
    coordinates.latitude,
    coordinates.longitude,
    supportedCity.lat,
    supportedCity.lng
  );

  if (distanceToCityCenter > supportedCity.radiusKm) {
    return null;
  }

  return {
    id: `${element.type}-${element.id}`,
    name: tags['name'] ?? '',
    category: categoryLabels[tags['amenity'] ?? ''] ?? '',
    distanceKm,
    latitude: coordinates.latitude,
    longitude: coordinates.longitude,
    address: buildAddress(tags),
    phone: tags['phone'] ?? tags['contact:phone'] ?? null,
    openingHours: tags['opening_hours'] ?? null,
    source: 'openstreetmap',
  };
}

function buildOverpassQuery(
  userCoordinates: Coordinates,
  radiusMeters: number
): string {
  const { latitude, longitude } = userCoordinates;

  return `
    [out:json][timeout:${OVERPASS_TIMEOUT_SECONDS}];
    (
      node["amenity"~"^(restaurant|cafe|fast_food|food_court|bar|pub|ice_cream)$"](around:${radiusMeters},${latitude},${longitude});
      way["amenity"~"^(restaurant|cafe|fast_food|food_court|bar|pub|ice_cream)$"](around:${radiusMeters},${latitude},${longitude});
      relation["amenity"~"^(restaurant|cafe|fast_food|food_court|bar|pub|ice_cream)$"](around:${radiusMeters},${latitude},${longitude});
    );
    out center tags;
  `;
}

async function tryEndpoint(endpoint: string, query: string): Promise<OverpassResponse | null> {
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      if (attempt > 0) {
        await new Promise((r) => setTimeout(r, 1000 * attempt));
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
        },
        body: `data=${encodeURIComponent(query)}`,
        signal: AbortSignal.timeout(OVERPASS_TIMEOUT_SECONDS * 1000),
      });

      if (!response.ok) {
        if (response.status === 504) continue;
        return null;
      }

      return (await response.json()) as OverpassResponse;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'TimeoutError') {
        continue;
      }
      return null;
    }
  }

  return null;
}

async function requestOverpass(query: string): Promise<OverpassResponse> {
  for (const endpoint of OVERPASS_ENDPOINTS) {
    const result = await tryEndpoint(endpoint, query);
    if (result) return result;
  }

  throw new Error('Overpass: todas as tentativas falharam');
}

export async function fetchNearbyEstablishments({
  userCoordinates,
  city,
  radiusKm,
  limit = 40,
}: FetchEstablishmentsOptions): Promise<Establishment[]> {
  const boundedRadiusKm = Math.min(radiusKm, city.radiusKm, MAX_QUERY_RADIUS_METERS / 1000);
  const query = buildOverpassQuery(userCoordinates, Math.round(boundedRadiusKm * 1000));
  const data = await requestOverpass(query);
  const uniqueResults = new Map<string, Establishment>();

  for (const element of data.elements) {
    const establishment = toEstablishment(
      element,
      userCoordinates,
      city,
      boundedRadiusKm
    );

    if (establishment) {
      uniqueResults.set(establishment.id, establishment);
    }
  }

  return [...uniqueResults.values()]
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}
