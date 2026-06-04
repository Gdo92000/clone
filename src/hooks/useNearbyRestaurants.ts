import { useMemo } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { useRestaurants } from './useRestaurants';
import { calculateDistance } from '../domain/geospatial/geodesy';
import type { Restaurant } from '../types';

export interface NearbyRestaurant extends Restaurant {
  distanceKm: number;
}

interface UseNearbyRestaurantsOptions {
  maxDistanceKm?: number;
  limit?: number;
  includeAllIfNoLocation?: boolean;
}

export function useNearbyRestaurants(options: UseNearbyRestaurantsOptions = {}) {
  const { coordinates, isWithinSupportedCity, loading: locationLoading } = useLocationContext();
  const { maxDistanceKm = 10, limit, includeAllIfNoLocation = true } = options;
  const { data: allRestaurants = [], isLoading: dataLoading } = useRestaurants();

  const nearbyRestaurants = useMemo(() => {
    if (!coordinates || !isWithinSupportedCity) {
      if (includeAllIfNoLocation) {
        const base = allRestaurants
          .map((r) => ({ ...r, distanceKm: parseFloat(r.distance.replace(' km', '')) || 0 }));
        return limit ? base.slice(0, limit) : base;
      }
      return [];
    }

    return allRestaurants
      .filter((r) => r.coordinates)
      .map((r) => ({
        ...r,
        distanceKm: r.coordinates
          ? calculateDistance(coordinates.latitude, coordinates.longitude, r.coordinates.lat, r.coordinates.lng)
          : Infinity,
      }))
      .filter((r) => r.distanceKm <= maxDistanceKm)
      .sort((a, b) => a.distanceKm - b.distanceKm)
      .slice(0, limit ?? Infinity);
  }, [coordinates, isWithinSupportedCity, maxDistanceKm, limit, includeAllIfNoLocation, allRestaurants]);

  return {
    restaurants: nearbyRestaurants,
    isLoading: locationLoading || dataLoading,
    hasLocation: !!coordinates,
    isWithinSupportedCity,
  };
}
