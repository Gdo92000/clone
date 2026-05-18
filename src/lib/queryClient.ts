import { QueryClient } from '@tanstack/react-query';
import { successToast, errorToast } from './toast';

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 2,
        staleTime: 1000 * 60 * 2,
        gcTime: 1000 * 60 * 5,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let lastErrorKey = '';
let lastErrorTime = 0;

function showMutationError(message: string, key: string): void {
  const now = Date.now();
  if (key === lastErrorKey && now - lastErrorTime < 3000) return;
  lastErrorKey = key;
  lastErrorTime = now;
  errorToast(message);
}

export function createMutateHandlers() {
  return {
    onSuccess: (message: string) => {
      successToast(message);
    },
    onError: (error: unknown, fallback?: string) => {
      let message = fallback ?? 'Erro ao realizar operação.';

      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        message = axiosError.response?.data?.message ?? message;
      } else if (error instanceof Error) {
        message = error.message;
      }

      showMutationError(message, message);
    },
  };
}

export const queryClient = createQueryClient();