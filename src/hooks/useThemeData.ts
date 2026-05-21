import { useQuery } from '@tanstack/react-query';
import { themeApi } from '../api/themeApi';
import { themeKeys } from '../api/queryKeys';

export function useMyTheme(area: string) {
  return useQuery({
    queryKey: themeKeys.myTheme(area),
    queryFn: () => themeApi.getMyTheme(),
    enabled: !!area,
    staleTime: 1000 * 60 * 5,
  });
}
