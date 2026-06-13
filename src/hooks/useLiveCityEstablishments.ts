import { useCallback, useMemo, useRef, useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { getRestaurants } from '../repositories/restaurantRepository';
import { useCityCoverage } from './useActiveCities';
import { calculateDistance } from '../domain/geospatial/geodesy';

export interface LocalEstablishment {
  id: string;
  name: string;
  category: string;
  distanceKm: number;
  latitude: number;
  longitude: number;
  address: string | null;
  phone: string | null;
  openingHours: string | null;
  neighborhood: string | null;
  isSameNeighborhood: boolean;
}

interface UseLiveCityEstablishmentsOptions {
  radiusKm?: number;
  limit?: number;
}

interface ProtectionStatus {
  canSearch: boolean;
  reason: string | null;
  activeRadiusKm: number;
}

export function useLiveCityEstablishments(
  options: UseLiveCityEstablishmentsOptions = {}
): {
  establishments: LocalEstablishment[];
  loading: boolean;
  error: string | null;
  protection: ProtectionStatus;
      search: () => Promise<void>;
  clear: () => void;
} {
  const { radiusKm = 5, limit = 40 } = options;
  const {
     coordinates,
     city,
   } = useLocationContext();
   const userNeighborhood = city?.neighborhood;

  const cityCoverageQuery = useCityCoverage(city?.name, city?.state);
  const hasCityCoverage = cityCoverageQuery.data === true;

  const [establishments, setEstablishments] = useState<LocalEstablishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inFlightRef = useRef(false);

  const protection = useMemo<ProtectionStatus>(() => {
    if (!coordinates) {
      return {
        canSearch: false,
        reason: 'Ative a localizacao para buscar estabelecimentos perto de voce.',
        activeRadiusKm: radiusKm,
      };
    }

    if (!city) {
      return {
        canSearch: false,
        reason: 'Ative a localizacao para identificar sua cidade.',
        activeRadiusKm: radiusKm,
      };
    }

    if (!hasCityCoverage) {
      return {
        canSearch: false,
        reason: `Nao temos estabelecimento cadastrado em "${city.name}".`,
        activeRadiusKm: radiusKm,
      };
    }

    return {
      canSearch: true,
      reason: null,
      activeRadiusKm: radiusKm,
    };
  }, [
    city,
    coordinates,
    hasCityCoverage,
    radiusKm,
  ]);

  const search = useCallback(async () => {
    if (inFlightRef.current) return;
    if (!coordinates || !city || !protection.canSearch) {
      setError(protection.reason);
      return;
    }

    inFlightRef.current = true;
    setLoading(true);
    setError(null);

    const cityName = city.name.toLowerCase();

    try {
      const all = await getRestaurants();

      const localResults: LocalEstablishment[] = all
        .filter((r) => {
          if (!r.coordinates) return false;
          if (r.city?.toLowerCase() !== cityName) return false;
          const dist = calculateDistance(
            coordinates.latitude,
            coordinates.longitude,
            r.coordinates.lat,
            r.coordinates.lng,
          );
          return dist <= protection.activeRadiusKm;
        })
        .map((r) => {
          const distanceKm = r.coordinates
            ? calculateDistance(
                coordinates.latitude,
                coordinates.longitude,
                r.coordinates.lat,
                r.coordinates.lng,
              )
            : Infinity;
          const isSameNeighborhood =
            userNeighborhood != null &&
            r.neighborhood != null &&
            userNeighborhood.toLowerCase() === r.neighborhood.toLowerCase();

          return {
            id: r.id,
            name: r.name,
            category: r.cuisine,
            distanceKm,
            latitude: r.coordinates?.lat ?? 0,
            longitude: r.coordinates?.lng ?? 0,
            address: r.address ?? null,
            phone: r.phone ?? null,
            openingHours: null,
            neighborhood: r.neighborhood ?? null,
            isSameNeighborhood,
          };
        })
        .sort((a, b) => {
          if (a.isSameNeighborhood !== b.isSameNeighborhood) {
            return a.isSameNeighborhood ? -1 : 1;
          }
          return a.distanceKm - b.distanceKm;
        })
        .slice(0, limit);

      setEstablishments(localResults);

      if (localResults.length === 0) {
        setError('Nenhum estabelecimento encontrado nesta area.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar estabelecimentos');
    } finally {
      setLoading(false);
      inFlightRef.current = false;
    }
  }, [city, coordinates, limit, protection, userNeighborhood]);

  const clear = useCallback(() => {
    setEstablishments([]);
    setError(null);
  }, []);

  return {
    establishments,
    loading,
    error,
    protection,
    search,
    clear,
  };
}
