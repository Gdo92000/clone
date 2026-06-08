/**
 * Restaurant Filter Service
 *
 * Responsável por:
 * - Filtrar restaurantes por localização
 * - Ordenar por distância
 * - Calcular distâncias com memoization
 * - Aplicar critérios de cobertura
 */

import type { Coordinates } from '../../domain/geospatial/geodesy';
import type { UserLocation } from '../../domain/location/types';
import { calculateDistance } from '../../domain/geospatial/geodesy';
import { normalizeCityName } from '../../domain/coverage/CityCoverage';
import type { Restaurant } from '../../domain/entities/Restaurant';

export interface RestaurantWithDistance {
  restaurant: Restaurant;
  distanceKm: number;
  isSameNeighborhood: boolean;
}

/**
 * Configuração para filtragem de restaurantes
 */
export interface FilterOptions {
  /**
   * Localização do usuário (obrigatória para filtros de distância)
   */
  userLocation: UserLocation | null;

  /**
   * Filtro de cidade ativo (normalmente vindo do contexto)
   * Se definido, filtra apenas restaurantes desta cidade
   * (mesmo que não tenha coordenadas)
   */
  cityName?: string;

  /**
   * Distância máxima em km
   * Se undefined, mostra todos dentro da cidade
   */
  maxDistanceKm?: number;

  /**
   * Se deve incluir TODOS os restaurantes quando
   * localização indisponível ou fora de suporte
   */
  includeAllIfNoLocation?: boolean;

  /**
   * Priorizar bairro: se true, restaurantes no mesmo bairro
   * aparecem primeiro
   */
  prioritizeSameNeighborhood?: boolean;
}

/**
 * Serviço de filtragem de restaurantes
 */
export class RestaurantFilterService {
  private distanceCache = new Map<string, number>();

  /**
   * Filtra e ordena restaurantes conforme opções
   */
  filterRestaurants(
    restaurants: Restaurant[],
    options: FilterOptions
  ): RestaurantWithDistance[] {
    const {
      userLocation,
      cityName,
      maxDistanceKm,
      includeAllIfNoLocation = true,
      prioritizeSameNeighborhood = true,
    } = options;

    // Se não tem localização, retorna todos ou vazio conforme configuração
    if (!userLocation?.coordinates) {
      return includeAllIfNoLocation
        ? this.addAllWithZeroDistance(restaurants)
        : [];
    }

    const { coordinates: userCoords } = userLocation;

    // Se cidade definida, filtra primeiro por nome da cidade
    let filtered = restaurants;
    if (cityName) {
      filtered = this.filterByCity(restaurants, cityName);
    }

    // Se não tem coordenadas válidas, retorna todos da cidade
    const restaurantsWithCoords = filtered.filter(hasValidRestaurantCoordinates);

    if (restaurantsWithCoords.length === 0) {
      return this.addAllWithZeroDistance(filtered);
    }

     // Calcula distância para cada restaurante
     const withDistance: RestaurantWithDistance[] = restaurantsWithCoords.map(
       (restaurant): RestaurantWithDistance => {
         const { lat, lng } = restaurant.coordinates;
         const coords = { latitude: lat, longitude: lng };
         const cacheKey = `${restaurant.id}-${userCoords.latitude.toFixed(
           5
         )}-${userCoords.longitude.toFixed(5)}`;

         let distanceKm = this.distanceCache.get(cacheKey);
         if (distanceKm === undefined) {
           distanceKm = calculateDistance(
             userCoords.latitude,
             userCoords.longitude,
             coords.latitude,
             coords.longitude
           );
           this.distanceCache.set(cacheKey, distanceKm);
         }

        const isSameNeighborhood =
          prioritizeSameNeighborhood &&
          userLocation.city?.neighborhood &&
          restaurant.neighborhood &&
          normalizeCityName(userLocation.city.neighborhood) ===
            normalizeCityName(restaurant.neighborhood);

        return { restaurant, distanceKm, isSameNeighborhood: !!isSameNeighborhood };
      }
    );

    // Filtra por distância máxima (se definida)
    let result = withDistance;
    if (maxDistanceKm !== undefined) {
      result = withDistance.filter((r) => r.distanceKm <= maxDistanceKm);
    }

    // Ordena: primeiro por bairro, depois por distância
    result.sort((a, b) => {
      if (a.isSameNeighborhood !== b.isSameNeighborhood) {
        return a.isSameNeighborhood ? -1 : 1;
      }
      return a.distanceKm - b.distanceKm;
    });

    // Limpa cache periodicamente (para evitar vazamento entre diferentes usuários)
    if (this.distanceCache.size > 1000) {
      this.distanceCache.clear();
    }

    return result;
  }

  /**
   * Filtra apenas by distance without city filter
   */
  filterByProximity(
    restaurants: Restaurant[],
    userCoords: Coordinates,
    maxDistanceKm: number
  ): RestaurantWithDistance[] {
    return this.filterRestaurants(restaurants, {
      userLocation: { coordinates: userCoords, source: 'gps', timestamp: Date.now() },
      maxDistanceKm,
      includeAllIfNoLocation: false,
      prioritizeSameNeighborhood: false,
    });
  }

  /**
   * Verifica se um restaurante está dentro da área de cobertura
   */
  isRestaurantInCoverage(
    restaurant: Restaurant,
    userLocation: UserLocation,
    coverageRadiusKm: number
  ): boolean {
    if (!hasValidRestaurantCoordinates(restaurant)) {
      return false;
    }
    const distance = calculateDistance(
      userLocation.coordinates.latitude,
      userLocation.coordinates.longitude,
      restaurant.coordinates.lat,
      restaurant.coordinates.lng
    );
    return distance <= coverageRadiusKm;
  }

  /**
   * Limpa cache interno (não persiste)
   */
  clearCache(): void {
    this.distanceCache.clear();
  }

  // --- Helpers privados ---

  private filterByCity(
    restaurants: Restaurant[],
    cityName: string
  ): Restaurant[] {
    const normalizedInput = normalizeCityName(cityName);
    return restaurants.filter((r) =>
      r.city ? normalizeCityName(r.city) === normalizedInput : false
    );
  }

  private addAllWithZeroDistance(
    restaurants: Restaurant[]
  ): RestaurantWithDistance[] {
    return restaurants.map((restaurant) => ({
      restaurant,
      distanceKm: 0,
      isSameNeighborhood: false,
    }));
  }
}

// Singleton
let filterServiceInstance: RestaurantFilterService | null = null;

export function getRestaurantFilterService(): RestaurantFilterService {
  if (!filterServiceInstance) {
    filterServiceInstance = new RestaurantFilterService();
  }
  return filterServiceInstance;
}

type RestaurantWithCoordinates = Restaurant & { coordinates: { lat: number; lng: number } };

function hasValidRestaurantCoordinates(restaurant: Restaurant): restaurant is RestaurantWithCoordinates {
  const { coordinates } = restaurant;
  return coordinates !== undefined && isFinite(coordinates.lat) && isFinite(coordinates.lng);
}
