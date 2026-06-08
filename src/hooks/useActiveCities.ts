import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { citiesApi } from '../api/citiesApi';
import type { ActiveCityDTO, ActiveNeighborhoodDTO } from '../dto/restaurantDto';
import { citiesKeys } from '../api/queryKeys';

const STALE_TIME_5_MIN = 5 * 60 * 1000;

export function useActiveCities(): UseQueryResult<ActiveCityDTO[]> {
  return useQuery({
    queryKey: citiesKeys.active(),
    queryFn: () => citiesApi.listActive(),
    staleTime: STALE_TIME_5_MIN,
  });
}

export function useActiveNeighborhoods(
  city: string | undefined,
  state: string | undefined,
): UseQueryResult<ActiveNeighborhoodDTO[]> {
  return useQuery({
    queryKey: citiesKeys.neighborhoods(city ?? '', state ?? ''),
    queryFn: () => citiesApi.listActiveNeighborhoods(city as string, state as string),
    enabled: Boolean(city) && Boolean(state),
    staleTime: STALE_TIME_5_MIN,
  });
}

export function useCityCoverage(
  city: string | undefined,
  state: string | undefined,
): UseQueryResult<boolean> {
  return useQuery({
    queryKey: citiesKeys.coverage(city ?? '', state ?? ''),
    queryFn: () => citiesApi.hasCityCoverage(city as string, state as string),
    enabled: Boolean(city) && Boolean(state),
    staleTime: STALE_TIME_5_MIN,
  });
}

export function useNeighborhoodCoverage(
  city: string | undefined,
  state: string | undefined,
  neighborhood: string | undefined,
): UseQueryResult<boolean> {
  return useQuery({
    queryKey: citiesKeys.neighborhoodCoverage(city ?? '', state ?? '', neighborhood ?? ''),
    queryFn: () => citiesApi.hasNeighborhoodCoverage(city as string, state as string, neighborhood as string),
    enabled: Boolean(city) && Boolean(state) && Boolean(neighborhood),
    staleTime: STALE_TIME_5_MIN,
  });
}
