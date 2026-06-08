/**
 * @vitest
 */
import { describe, it, expect, beforeEach } from 'vitest';
 import { RestaurantFilterService } from '../../../services/filters/RestaurantFilterService';
 import type { Restaurant } from '../../../types/restaurant';
 import type { UserLocation } from '../../../domain/location/types';

// Mock de restaurantes com coordenadas válidas
const mockRestaurants: Restaurant[] = [
  {
    id: 'rest-1',
    name: 'Burger Próximo',
    cuisine: 'Hamburguer',
    city: 'São Paulo',
    state: 'SP',
    coordinates: { lat: -23.5500, lng: -46.6300 },
    rating: 4.5,
    deliveryFee: 5,
    deliveryTime: '30-40',
    isFeatured: true,
  },
  {
    id: 'rest-2',
    name: 'Pizza Distante',
    cuisine: 'Pizza',
    city: 'São Paulo',
    state: 'SP',
    coordinates: { lat: -23.6000, lng: -46.7000 },
    rating: 4.2,
    deliveryFee: 8,
    deliveryTime: '45-60',
    isFeatured: false,
  },
  {
    id: 'rest-3',
    name: 'Sushi Mesmo Bairro',
    cuisine: 'Japonesa',
    city: 'São Paulo',
    state: 'SP',
    coordinates: { lat: -23.5550, lng: -46.6350 },
    rating: 4.7,
    deliveryFee: 10,
    deliveryTime: '40-50',
    isFeatured: true,
    neighborhood: 'Pinheiros',
  },
  {
    id: 'rest-4',
    name: 'Sem Coordenadas',
    cuisine: 'Brasileira',
    city: 'São Paulo',
    state: 'SP',
    coordinates: undefined,
    rating: 4.0,
    deliveryFee: 0,
    deliveryTime: '30-45',
    isFeatured: false,
  },
];

// Localização central em São Paulo (Pinheiros)
const userLocation: UserLocation = {
  coordinates: { latitude: -23.5530, longitude: -46.6330 },
  city: { name: 'São Paulo', state: 'SP', country: 'Brasil', neighborhood: 'Pinheiros' },
  source: 'gps',
  timestamp: Date.now(),
};

// Localização fora de SP (Rio)
const _userLocationRio: UserLocation = {
  coordinates: { latitude: -22.9068, longitude: -43.1729 },
  city: { name: 'Rio de Janeiro', state: 'RJ', country: 'Brasil' },
  source: 'gps',
  timestamp: Date.now(),
};

describe('RestaurantFilterService', () => {
  let service: RestaurantFilterService;

  beforeEach(() => {
    service = new RestaurantFilterService();
  });

  describe('filterRestaurants', () => {
    it('deve retornar todos quando não há localização e includeAllIfNoLocation=true', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation: null,
        includeAllIfNoLocation: true,
      });
      expect(result.length).toBe(mockRestaurants.length);
      expect(result.every((r) => r.distanceKm === 0)).toBe(true);
    });

    it('deve retornar vazio quando não há localização e includeAllIfNoLocation=false', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation: null,
        includeAllIfNoLocation: false,
      });
      expect(result).toEqual([]);
    });

    it('deve filtrar e ordenar por distância quando localização fornecida', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        includeAllIfNoLocation: false,
      });

      expect(result.length).toBe(3); // Apenas com coordinates
      // Restaurante com coordenadas mais próximas deve vir primeiro
      expect(result[0].restaurant.id).toBe('rest-3'); // ~2km
      expect(result[1].restaurant.id).toBe('rest-1'); // ~4km
      expect(result[2].restaurant.id).toBe('rest-2'); // ~8km
    });

    it('deve priorizar mesmo bairro', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        prioritizeSameNeighborhood: true,
      });

      // O sushi (bairro Pinheiros) deve vir antes dos outros da mesma distância aproximada
      expect(result[0].isSameNeighborhood).toBe(true);
      expect(result[0].restaurant.neighborhood).toBe('Pinheiros');
    });

    it('deve aplicar maxDistanceKm', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        maxDistanceKm: 3, // ~3km
      });

      expect(result.every((r) => r.distanceKm <= 3)).toBe(true);
    });

    it('deve filtrar por cidade quando cityName fornecido', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        cityName: 'São Paulo',
      });

      expect(result.every((r) => r.restaurant.city === 'São Paulo')).toBe(true);
    });

    it('deve filtrar por cidade ignorando acentos e caixa', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        cityName: 'sao paulo',
      });

      expect(result).toHaveLength(3);
      expect(result.every((r) => r.restaurant.city === 'São Paulo')).toBe(true);
    });

    it('deve retornar vazio quando cidade não coincide', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        cityName: 'Rio de Janeiro',
      });

      expect(result).toEqual([]);
    });

    it('deve ignorar restaurantes sem coordenadas quando há localização', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation,
        includeAllIfNoLocation: false,
      });

      expect(result.some((r) => r.restaurant.id === 'rest-4')).toBe(false);
    });

    it('deve priorizar bairro ignorando acentos e caixa', () => {
      const result = service.filterRestaurants(mockRestaurants, {
        userLocation: {
          ...userLocation,
          city: { name: 'São Paulo', state: 'SP', country: 'Brasil', neighborhood: 'pinheiros' },
        },
        prioritizeSameNeighborhood: true,
      });

      expect(result[0]?.restaurant.id).toBe('rest-3');
      expect(result[0]?.isSameNeighborhood).toBe(true);
    });
  });

  describe('isRestaurantInCoverage', () => {
    it('deve retornar true se restaurante dentro do raio', () => {
      const coverageRadiusKm = 10;
      const result = service.isRestaurantInCoverage(mockRestaurants[0], userLocation, coverageRadiusKm);
      expect(result).toBe(true);
    });

    it('deve retornar false se restaurante fora do raio', () => {
      const coverageRadiusKm = 3;
      const result = service.isRestaurantInCoverage(mockRestaurants[1], userLocation, coverageRadiusKm);
      expect(result).toBe(false);
    });

    it('deve retornar false se restaurante sem coordenadas', () => {
      const result = service.isRestaurantInCoverage(mockRestaurants[3], userLocation, 10);
      expect(result).toBe(false);
    });
  });
});
