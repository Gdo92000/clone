export interface AutocompleteSuggestion {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  city: string;
  state: string;
  zipcode: string;
  country: string;
  neighborhood: string;
  street: string;
}

interface CacheEntry {
  data: AutocompleteSuggestion[];
  timestamp: number;
}

interface PhotonProperties {
  osm_type?: string;
  osm_id?: number;
  osm_key?: string;
  osm_value?: string;
  type?: string;
  name?: string;
  street?: string;
  housenumber?: string;
  postcode?: string;
  city?: string;
  state?: string;
  country?: string;
  countrycode?: string;
  county?: string;
  locality?: string;
  district?: string;
  suburb?: string;
  neighbourhood?: string;
  extent?: number[];
}

interface PhotonFeature {
  geometry: { coordinates: [number, number] };
  properties: PhotonProperties;
}

import { photonApi } from '../api/photonApi';
import { viaCepApi } from '../api/viaCepApi';
import { nominatimApi } from '../api/nominatimApi';
import { logger } from '../lib/logger';
import { BRAZIL_STATE_NAMES, normalizeState } from '../lib/brazilStates';

const cache = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000;

let lastNominatimRequest = 0;

async function rateLimitedNominatimSearch(query: string) {
  const now = Date.now();
  const elapsed = now - lastNominatimRequest;
  if (elapsed < 1100) {
    await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
  }
  lastNominatimRequest = Date.now();
  return nominatimApi.search(query);
}

export function clearAddressCache(): void {
  cache.clear();
}

function getCached(query: string): AutocompleteSuggestion[] | null {
  const entry = cache.get(query);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(query);
    return null;
  }
  return entry.data;
}

function setCache(query: string, data: AutocompleteSuggestion[]): void {
  cache.set(query, { data, timestamp: Date.now() });
}

function isBrazilianResult(props: PhotonProperties): boolean {
  return props.countrycode === 'BR' || props.country === 'Brazil';
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s\-.,/]/g, '')
    .trim();
}

function normalizeStreetName(street: string): string {
  return street
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/^(Rua|Avenida|Av\.|Alameda|Travessa|Estrada|Rodovia|Praça|Praca|Largo|Viela|Beco|Passagem|Servidao|Servidão)\s+/i, '')
    .replace(/[^a-zA-Z0-9\s]/g, '')
    .trim()
    .toLowerCase();
}

function getNeighborhood(props: PhotonProperties): string {
  const candidates = [
    props.suburb,
    props.neighbourhood,
    props.locality,
    props.district,
    props.county,
  ].filter(Boolean) as string[];

  const genericTerms = ['center', 'downtown', 'vila', 'bairro'];

  for (const candidate of candidates) {
    const lower = candidate.toLowerCase();
    const isGeneric = genericTerms.some((term) => lower === term);
    if (!isGeneric || lower === 'centro') {
      return candidate;
    }
  }

  return candidates[0] ?? '';
}

function isStreetFeature(props: PhotonProperties): boolean {
  return props.osm_value === 'residential' ||
    props.osm_value === 'primary' ||
    props.osm_value === 'secondary' ||
    props.osm_value === 'tertiary' ||
    props.osm_value === 'unclassified' ||
    props.type === 'street' ||
    props.type === 'road' ||
    props.osm_key === 'highway';
}

function buildSuggestion(feature: PhotonFeature): AutocompleteSuggestion | null {
  const p = feature.properties;
  const coords = feature.geometry.coordinates;
  const lng = coords[0];
  const lat = coords[1];

  if (!lat || !lng) return null;
  if (isNaN(lat) || isNaN(lng)) return null;

  const isBrazil = isBrazilianResult(p);
  const street = p.name ?? p.street ?? '';
  const neighborhood = getNeighborhood(p);
  const city = p.city ?? '';
  const state = normalizeState(p.state ?? '');
  const country = p.country ?? '';

  if (isBrazil && !city) {
    logger.warn('Photon', 'Brazilian result without city, skipping', { street });
    return null;
  }

  if (isBrazil && !state && !BRAZIL_STATE_NAMES.some(s => country.toLowerCase().includes(s))) {
    logger.warn('Photon', 'Brazilian result without state, skipping', { street, city });
    return null;
  }

  const addressParts: string[] = [];
  if (street) addressParts.push(street);
  if (neighborhood) addressParts.push(neighborhood);
  if (city) addressParts.push(city);
  if (state) addressParts.push(state);

  const formattedAddress = addressParts.join(', ') || 'Endereço não encontrado';

  return {
    formattedAddress,
    latitude: lat,
    longitude: lng,
    city,
    state,
    zipcode: '',
    country,
    neighborhood,
    street,
  };
}

function enhanceQuery(query: string): string {
  return normalizeText(query);
}

async function enrichBrazilianByAddress(
   suggestion: AutocompleteSuggestion,
 ): Promise<AutocompleteSuggestion[]> {
   if (!suggestion.state || suggestion.state.length !== 2) return [suggestion];
   if (!suggestion.city) return [suggestion];
   if (!suggestion.street) return [suggestion];

   try {
     const viaCepResults = await viaCepApi.lookupByAddress(
       suggestion.state,
       suggestion.city,
       suggestion.street
     );

     const enriched: AutocompleteSuggestion[] = [];

     for (const entry of viaCepResults) {
       if (!entry.cep) continue;

       enriched.push({
         ...suggestion,
         neighborhood: entry.bairro,
         zipcode: entry.cep,
         formattedAddress: buildFormattedAddress({
           street: suggestion.street,
           neighborhood: entry.bairro,
           city: entry.localidade,
           state: entry.uf,
           zipcode: entry.cep,
         }),
       });
     }

     if (enriched.length === 0) {
       return [suggestion];
     }

     return enriched;
  } catch (err) {
    logger.error('ViaCEP', 'Erro na busca por logradouro', err);
    return [suggestion];
  }
 }

function buildFormattedAddress(parts: {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}): string {
  return [parts.street, parts.neighborhood, parts.city, parts.state, parts.zipcode]
    .filter(Boolean)
    .join(', ');
}

async function fetchPhotonResponse(query: string): Promise<{ features?: PhotonFeature[] } | null> {
  try {
    const result = await photonApi.search(query);
    return result;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw err;
    }
    logger.error('Photon', 'API error', err);
    return null;
  }
 }

function extractValidFeatures(data: { features?: unknown[] }): PhotonFeature[] {
  const features = data.features;
  if (!Array.isArray(features)) {
    logger.warn('Photon', 'No features array in response');
    return [];
  }

  const valid: PhotonFeature[] = [];
  for (const f of features) {
    if (f && typeof f === 'object' && 'geometry' in f && 'properties' in f) {
      const geom = (f as Record<string, unknown>)['geometry'];
      if (geom && typeof geom === 'object' && 'coordinates' in geom) {
        const coords = (geom as Record<string, unknown>)['coordinates'];
        if (Array.isArray(coords) && coords.length >= 2) {
          valid.push(f as PhotonFeature);
        }
      }
    }
  }
  return valid;
}

function buildSuggestionsFromFeatures(validFeatures: PhotonFeature[]): AutocompleteSuggestion[] {
  const streetFeatures = validFeatures.filter((f) => isStreetFeature(f.properties));

  const suggestions: AutocompleteSuggestion[] = [];
  const seen = new Set<string>();

  for (const feature of streetFeatures) {
    const suggestion = buildSuggestion(feature);
    if (!suggestion) continue;

    const key = `${normalizeStreetName(suggestion.street)}|${suggestion.city}|${suggestion.state}`;
    if (seen.has(key)) continue;
    seen.add(key);

    if (suggestion.formattedAddress === 'Endereço não encontrado') {
      logger.warn('Photon', 'Empty address skipped');
      continue;
    }

    suggestions.push(suggestion);
  }

  return suggestions;
}

async function enrichSuggestions(suggestions: AutocompleteSuggestion[]): Promise<AutocompleteSuggestion[]> {
  const enrichedRaw = await Promise.all(
    suggestions.map(async (s) => {
      const isBrazil = s.country === 'Brazil' || (s.state.length === 2 && s.city.length > 0);
      if (!isBrazil) return [s];

      if (s.street && s.city && s.state.length === 2) {
        return enrichBrazilianByAddress(s);
      }

      return [s];
    }),
  );

  const enriched = enrichedRaw.flat();

  const seen = new Set<string>();
  return enriched.filter((s) => {
    const key = `${s.street}|${s.city}|${s.state}|${s.zipcode}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function filterByCity(suggestions: AutocompleteSuggestion[], targetCity: string | undefined): AutocompleteSuggestion[] {
  if (!targetCity) return suggestions;
  return suggestions.filter((s) => s.city.toLowerCase().includes(targetCity.toLowerCase()));
}

export async function fetchSuggestions(
  query: string,
  _signal?: AbortSignal,
  targetCity?: string,
): Promise<AutocompleteSuggestion[]> {
  const trimmed = query.trim();
  if (trimmed.length < 3) return [];

  const cacheKey = targetCity ? `${trimmed}|${targetCity}` : trimmed;
  const cached = getCached(cacheKey);
  if (cached) return cached;

  const enhancedQuery = enhanceQuery(trimmed);

  try {
    const data = await fetchPhotonResponse(enhancedQuery);
    if (!data) return [];

    const validFeatures = extractValidFeatures(data);
    const suggestions = buildSuggestionsFromFeatures(validFeatures);

    const enriched = await enrichSuggestions(suggestions);
    const cityFiltered = filterByCity(enriched, targetCity);

    if (cityFiltered.length > 0) {
      setCache(cacheKey, cityFiltered);
    }

    return cityFiltered;
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    logger.error('Photon', 'Fetch error', err);
    return [];
  }
}

export async function geocodeAddress(
  address: string,
  _signal?: AbortSignal,
): Promise<AutocompleteSuggestion | null> {
  if (!address.trim()) return null;

  try {
    const raw = await rateLimitedNominatimSearch(address);
    if (!Array.isArray(raw) || raw.length === 0) return null;

    const r = raw[0];
    if (!r) return null;
    const addr = r.address;
    const city = addr?.city ?? addr?.town ?? addr?.village ?? '';
    const state = normalizeState(addr?.state ?? '');
    const neighborhood = addr?.suburb ?? addr?.neighbourhood ?? addr?.county ?? '';

    return {
      formattedAddress: r.display_name,
      latitude: parseFloat(r.lat),
      longitude: parseFloat(r.lon),
      city,
      state,
      zipcode: addr?.postcode ?? '',
      country: addr?.country ?? '',
      neighborhood,
      street: '',
    };
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err;
    return null;
  }
}
