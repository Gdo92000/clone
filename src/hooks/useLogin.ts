import { useMutation } from '@tanstack/react-query';
import { login as authServiceLogin } from '../services/authService';
import { errorToast } from '../lib/toast';
import type { AuthUser } from '../modules/auth/types';

interface LoginInput {
  email: string;
  password: string;
}

export function useLogin() {
  return useMutation<AuthUser, Error, LoginInput>({
    mutationFn: (input) => authServiceLogin(input),
    onError: (err) => {
      errorToast(err instanceof Error ? err.message : 'Erro ao entrar');
    },
  });
}
