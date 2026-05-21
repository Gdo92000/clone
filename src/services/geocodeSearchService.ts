export interface GeocodeResult {
  lat: number;
  lng: number;
  displayName: string;
}

import { nominatimApi } from '../api/nominatimApi';
import { logger } from '../lib/logger';

export async function geocodeByQuery(query: string): Promise<GeocodeResult | null> {
  if (!query.trim()) return null;

  try {
    const results = await nominatimApi.search(query);
    if (results.length === 0) return null;

    const first = results[0];
    if (!first) return null;

    return {
      lat: parseFloat(first.lat),
      lng: parseFloat(first.lon),
      displayName: first.display_name,
    };
  } catch (err) {
    logger.warn('GeocodeSearch', 'Geocoding failed, returning null', { query, error: String(err) });
    return null;
  }
}

export async function geocodeEstablishment(
  name: string,
  address: string,
  city: string,
  state: string,
): Promise<GeocodeResult | null> {
  // Tenta primeiro pelo nome + cidade
  const nameQuery = `${name}, ${city}, ${state}`;
  const byName = await geocodeByQuery(nameQuery);
  if (byName) return byName;

  // Fallback: endereço completo
  const addressQuery = `${address}, ${city}, ${state}`;
  return geocodeByQuery(addressQuery);
}