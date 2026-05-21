import { useQuery } from '@tanstack/react-query';
import { getRegisteredCityCoverages } from '../services/cityCoverageService';
import { coverageKeys } from '../api/queryKeys';

export function useRegisteredCityCoverages() {
  return useQuery({
    queryKey: coverageKeys.cities,
    queryFn: () => getRegisteredCityCoverages(),
    staleTime: 1000 * 60 * 5,
  });
}
