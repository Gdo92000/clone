import { useQuery } from '@tanstack/react-query';
import { coverageCityApi } from '../api';
import { coverageKeys } from '../api/queryKeys';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCoverageCities() {
  return useQuery({
    queryKey: coverageKeys.cities,
    queryFn: () => coverageCityApi.list(),
    staleTime: STALE_MEDIUM,
  });
}
