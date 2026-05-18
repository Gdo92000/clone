import { getRestaurants } from '../repositories/restaurantRepository';
import { calculateDistance } from './locationService';
import type { Restaurant } from '../types';

export interface RegisteredCityCoverage {
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

function computeCoverages(restaurants: Restaurant[]): RegisteredCityCoverage[] {
  const cityGroups = new Map<string, { name: string; state: string; coords: { lat: number; lng: number }[] }>();
  for (const r of restaurants) {
    if (!r.city || !r.coordinates) continue;
    const key = normalizeCityName(r.city);
    const g = cityGroups.get(key);
    if (g) { g.coords.push(r.coordinates); }
    else { cityGroups.set(key, { name: r.city, state: 'Sao Paulo', coords: [r.coordinates] }); }
  }
  return [...cityGroups.values()].map((g) => {
    const lat = g.coords.reduce((s, c) => s + c.lat, 0) / g.coords.length;
    const lng = g.coords.reduce((s, c) => s + c.lng, 0) / g.coords.length;
    const maxDist = g.coords.reduce((m, c) => Math.max(m, calculateDistance(lat, lng, c.lat, c.lng)), 0);
    return { name: g.name, state: g.state, lat, lng, radiusKm: Math.min(Math.max(maxDist + 5, 5), 25), restaurantCount: g.coords.length };
  });
}

export async function getRegisteredCityCoverages(): Promise<RegisteredCityCoverage[]> {
  const restaurants = await getRestaurants();
  return computeCoverages(restaurants);
}

export async function findRegisteredCityCoverage(cityName: string): Promise<RegisteredCityCoverage | null> {
  const coverages = await getRegisteredCityCoverages();
  return coverages.find((c) => isSameCityName(c.name, cityName)) ?? null;
}
