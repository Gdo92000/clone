import { QueryClient } from '@tanstack/react-query';
import { logger } from './logger';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
        meta: { source: 'react-query' },
      },
      mutations: {
        retry: 1,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 8000),
        meta: { source: 'react-query' },
        onError: (err: unknown) => {
          logger.error('Mutation', 'Mutation failed', err instanceof Error ? err : new Error(String(err)));
        },
      },
    },
  });
}

export const queryClient = createQueryClient();