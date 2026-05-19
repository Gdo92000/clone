import { useQuery } from '@tanstack/react-query';
import { coverageCityApi } from '../api';

const STALE_MEDIUM = 1000 * 60 * 5;

export function useCoverageCities() {
  return useQuery({
    queryKey: ['coverage-cities'],
    queryFn: () => coverageCityApi.list(),
    staleTime: STALE_MEDIUM,
  });
}
