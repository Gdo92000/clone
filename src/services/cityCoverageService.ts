import { calculateDistance } from './locationService';
import type { Restaurant } from '../types';

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
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000); // Timeout de 3s
    
    const res = await fetch('/api/coverage-cities', { 
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });
    clearTimeout(timeoutId);
    
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((c: { id: string; name: string; state: string; latitude: string; longitude: string; radius_km: number; restaurant_count: number }) => ({
      id: c.id,
      name: c.name,
      state: c.state,
      lat: Number(c.latitude),
      lng: Number(c.longitude),
      radiusKm: c.radius_km,
      restaurantCount: c.restaurant_count,
    }));
  } catch (error) {
    // API indisponível - retorna array vazio para fallback
    // Não faz log em produção para não poluir o console
    if (import.meta.env.DEV) {
      console.warn('Coverage API indisponível, usando fallback:', error);
    }
    return [];
  }
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
  // Em desenvolvimento: SEMPRE usa fallback para evitar erros de API
  if (import.meta.env.DEV) {
    try {
      // Tenta API, mas se falhar, usa dados mockados
      const api = await fetchFromApi();
      if (api.length > 0) return api;
    } catch {
      // Silencioso em dev
    }
    // Dados mockados para desenvolvimento
    return mockDevCoverages();
  }
  
  // Em produção: tenta API
  const api = await fetchFromApi();
  if (api.length > 0) return api;
  
  // Fallback: calcula a partir dos restaurantes locais
  const { getRestaurants } = await import('../repositories/restaurantRepository');
  const restaurants = await getRestaurants();
  return computeFromRestaurants(restaurants);
}

// Dados mockados para desenvolvimento
function mockDevCoverages(): RegisteredCityCoverage[] {
  return [
    {
      id: 'dev-sao-carlos',
      name: 'São Carlos',
      state: 'SP',
      lat: -22.0069,
      lng: -47.8911,
      radiusKm: 15,
      restaurantCount: 0,
    },
    {
      id: 'dev-franca',
      name: 'Franca',
      state: 'SP',
      lat: -20.5386,
      lng: -47.4008,
      radiusKm: 15,
      restaurantCount: 0,
    },
  ];
}

export async function findRegisteredCityCoverage(cityName: string): Promise<RegisteredCityCoverage | null> {
  try {
    const coverages = await getRegisteredCityCoverages();
    return coverages.find((c) => isSameCityName(c.name, cityName)) ?? null;
  } catch (error) {
    // Se falhar, retorna null (cidade não suportada)
    if (import.meta.env.DEV) {
      console.warn('Erro ao buscar cobertura da cidade:', cityName, error);
    }
    return null;
  }
}
