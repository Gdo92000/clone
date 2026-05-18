import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { getRestaurants } from '../repositories/restaurantRepository';
import type { Restaurant } from '../types';
import { calculateDistance } from '../services/locationService';

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
  const [allRestaurants, setAllRestaurants] = useState<Restaurant[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const initRef = useRef(false);

  useEffect(() => {
    if (initRef.current) return;
    initRef.current = true;
    void getRestaurants().then((r) => { setAllRestaurants(r); setDataLoading(false); });
  }, []);

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
        distanceKm: calculateDistance(coordinates.latitude, coordinates.longitude, r.coordinates!.lat, r.coordinates!.lng),
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