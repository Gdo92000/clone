import { coverageCityApi } from '../api/coverageCityApi';
import { calculateDistance } from '../domain/geospatial/geodesy';
import type { Restaurant } from '../types';
import { logger } from '../lib/logger';

export interface RegisteredCityCoverage {
  id: string;
  name: string;
  state: string;
  lat: number;
  lng: number;
  radiusKm: number;
  restaurantCount: number;
}

export function normalizeCityName(value: string): string {
  return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
}

export function isSameCityName(a: string, b: string): boolean {
  return normalizeCityName(a) === normalizeCityName(b);
}

async function fetchFromApi(): Promise<RegisteredCityCoverage[]> {
  const data = await coverageCityApi.list();
  return data.map((c) => ({
    id: c.id,
    name: c.name,
    state: c.state,
    lat: Number(c.latitude),
    lng: Number(c.longitude),
    radiusKm: c.radius_km,
    restaurantCount: c.restaurant_count,
  }));
}

function computeFromRestaurants(restaurants: Restaurant[]): RegisteredCityCoverage[] {
  const cityGroups = new Map<string, { name: string; state: string; coords: { lat: number; lng: number }[] }>();
  for (const r of restaurants) {
    if (!r.city || !r.coordinates) continue;
    const key = normalizeCityName(r.city);
    const g = cityGroups.get(key);
    if (g) { g.coords.push(r.coordinates); }
    else { cityGroups.set(key, { name: r.city, state: 'SP', coords: [r.coordinates] }); }
  }
  return [...cityGroups.values()].map((g) => {
    const lat = g.coords.reduce((s, c) => s + c.lat, 0) / g.coords.length;
    const lng = g.coords.reduce((s, c) => s + c.lng, 0) / g.coords.length;
    const maxDist = g.coords.reduce((m, c) => Math.max(m, calculateDistance(lat, lng, c.lat, c.lng)), 0);
    return { id: `city-${g.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`, name: g.name, state: g.state, lat, lng, radiusKm: Math.min(Math.max(maxDist + 5, 5), 25), restaurantCount: g.coords.length };
  });
}

export async function getRegisteredCityCoverages(): Promise<RegisteredCityCoverage[]> {
  try {
    const api = await fetchFromApi();
    if (api.length > 0) return api;
  } catch (err) {
    logger.warn('CityCoverage', 'API unavailable, falling back to restaurant-based computation', { error: String(err) });
  }

  const { getRestaurants } = await import('../repositories/restaurantRepository');
  const restaurants = await getRestaurants();
  return computeFromRestaurants(restaurants);
}

export async function findRegisteredCityCoverage(cityName: string): Promise<RegisteredCityCoverage | null> {
  try {
    const coverages = await getRegisteredCityCoverages();
    return coverages.find((c) => isSameCityName(c.name, cityName)) ?? null;
  } catch {
    return null;
  }
}
