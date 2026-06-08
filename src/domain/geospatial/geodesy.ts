/**
 * Geospatial Domain - Cálculos e Validações
 *
 * Responsável por:
 * - Cálculo de distância (Haversine)
 * - Validação de coordenadas
 * - Operações espaciais
 */

/**
 * Coordenadas geográficas (latitude, longitude)
 */
 export interface Coordinates {
   latitude: number;
   longitude: number;
   /**
    * Precisão da leitura em metros (opcional, padrão undefined)
    */
   accuracy?: number;
 }

/**
 * Raio da Terra em quilômetros (meio caminho entre polar e equatorial)
 */
export const EARTH_RADIUS_KM = 6371.0088;

/**
 * Converte graus para radianos
 */
export function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcula distância entre duas coordenadas usando a fórmula de Haversine
 *
 * @param lat1 Latitude do ponto A
 * @param lng1 Longitude do ponto A
 * @param lat2 Latitude do ponto B
 * @param lng2 Longitude do ponto B
 * @returns Distância em quilômetros
 *
 * @example
 * ```ts
 * const d = calculateDistance(-20.535, -47.395, -20.54, -47.40);
 * // ~1.2 km
 * ```
 */
export function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lng2 - lng1);

  const sinΔφ = Math.sin(Δφ / 2);
  const sinΔλ = Math.sin(Δλ / 2);

  const a =
    sinΔφ * sinΔφ +
    Math.cos(φ1) * Math.cos(φ2) * sinΔλ * sinΔλ;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
}

/**
 * Verifica se as coordenadas são válidas
 * - Latitude: entre -90 e 90
 * - Longitude: entre -180 e 180
 */
export function isValidCoordinates(coords: Coordinates): boolean {
  return (
    typeof coords.latitude === 'number' &&
    typeof coords.longitude === 'number' &&
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
}

/**
 * Normaliza coordenadas arredondando para precisão consistente (7 casas decimais)
 * ~1cm de precisão
 */
export function normalizeCoordinates(coords: Coordinates): Coordinates {
  return {
    latitude: Math.round(coords.latitude * 1e7) / 1e7,
    longitude: Math.round(coords.longitude * 1e7) / 1e7,
  };
}

/**
 * Verifica se um ponto está dentro de um círculo (cobertura)
 */
export function isPointInCircle(
  point: Coordinates,
  center: Coordinates,
  radiusKm: number
): boolean {
  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    center.latitude,
    center.longitude
  );
  return distance <= radiusKm;
}

/**
 * Calcula distância entre um ponto e um array de pontos
 * Retorna array ordenado por proximidade
 */
export function sortByDistance(
  reference: Coordinates,
  points: Coordinates[]
): Coordinates[] {
  return points
    .map((point) => ({
      point,
      distance: calculateDistance(
        reference.latitude,
        reference.longitude,
        point.latitude,
        point.longitude
      ),
    }))
    .sort((a, b) => a.distance - b.distance)
    .map((item) => item.point);
}

/**
 * Calcula centroide (média) de um array de coordenadas
 */
export function computeCentroid(coords: Coordinates[]): Coordinates | null {
  if (coords.length === 0) return null;
  const sum = coords.reduce(
    (acc, c) => ({
      lat: acc.lat + c.latitude,
      lng: acc.lng + c.longitude,
    }),
    { lat: 0, lng: 0 }
  );
  return {
    latitude: sum.lat / coords.length,
    longitude: sum.lng / coords.length,
  };
}

/**
 * Formata distância em km para exibição amigável
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)}km`;
}
