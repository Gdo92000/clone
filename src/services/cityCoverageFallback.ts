export interface RegisteredCityCoverage {
  id: string;
  name: string;
  state: string;
  latitude: number;
  longitude: number;
  radiusKm: number;
  restaurantCount: number;
  isActive: boolean;
}

const FALLBACK_CITIES: RegisteredCityCoverage[] = [
  {
    id: 'city-franca',
    name: 'Franca',
    state: 'SP',
    latitude: -20.5386,
    longitude: -47.4008,
    radiusKm: 18,
    restaurantCount: 8,
    isActive: true,
  },
];

export function findRegisteredCityCoverage(
  cityName: string,
): RegisteredCityCoverage | null {
  const normalized = cityName.toLowerCase().trim();
  return FALLBACK_CITIES.find((c) => c.name.toLowerCase() === normalized) ?? null;
}

export function getRegisteredCityCoverages(): RegisteredCityCoverage[] {
  return FALLBACK_CITIES;
}

export function normalizeCityName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}
