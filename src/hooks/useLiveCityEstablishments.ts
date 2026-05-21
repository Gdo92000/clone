import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocationContext } from '../context/LocationContext';
import { getRestaurants } from '../repositories/restaurantRepository';
import { findRegisteredCityCoverage } from '../services/cityCoverageService';
import { calculateDistance } from '../services/locationService';

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
     isWithinSupportedCity,
     distanceToCityCenter,
   } = useLocationContext();
   const userNeighborhood = city?.neighborhood;

  const [establishments, setEstablishments] = useState<LocalEstablishment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [supportedCity, setSupportedCity] = useState<Awaited<ReturnType<typeof findRegisteredCityCoverage>>>(null);

  useEffect(() => {
    const abort = new AbortController();
    void findRegisteredCityCoverage(city?.name ?? '').then((sc) => {
      if (!abort.signal.aborted) setSupportedCity(sc);
    });
    return () => { abort.abort(); };
  }, [city]);

  const protection = useMemo<ProtectionStatus>(() => {
    if (!coordinates) {
      return {
        canSearch: false,
        reason: 'Ative a localizacao para buscar estabelecimentos perto de voce.',
        activeRadiusKm: radiusKm,
      };
    }

    if (!city || !supportedCity) {
      return {
        canSearch: false,
        reason: city
          ? `Nao temos estabelecimento cadastrado em "${city.name}".`
          : 'Ative a localizacao para identificar sua cidade.',
        activeRadiusKm: radiusKm,
      };
    }

    if (!isWithinSupportedCity) {
      return {
        canSearch: false,
        reason: `A localizacao detectada esta fora do limite de ${supportedCity.name}.`,
        activeRadiusKm: radiusKm,
      };
    }

    const centerDistance = distanceToCityCenter ?? calculateDistance(
      coordinates.latitude,
      coordinates.longitude,
      supportedCity.lat,
      supportedCity.lng
    );
    const remainingCityRadius = Math.max(0, supportedCity.radiusKm - centerDistance);
    const activeRadiusKm = Math.max(1, Math.min(radiusKm, remainingCityRadius));

    if (activeRadiusKm <= 0) {
      return {
        canSearch: false,
        reason: 'Sua localizacao esta no limite da cidade validada.',
        activeRadiusKm: 0,
      };
    }

    return {
      canSearch: true,
      reason: null,
      activeRadiusKm,
    };
  }, [
    city,
    coordinates,
    distanceToCityCenter,
    isWithinSupportedCity,
    radiusKm,
    supportedCity,
  ]);

  const search = useCallback(async () => {
    if (!coordinates || !supportedCity || !protection.canSearch) {
      setError(protection.reason);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const all = await getRestaurants();

      const localResults: LocalEstablishment[] = all
        .filter((r) => {
          if (!r.coordinates) return false;
          if (r.city?.toLowerCase() !== supportedCity.name.toLowerCase()) return false;
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
    }
  }, [coordinates, limit, protection, supportedCity, userNeighborhood]);

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
