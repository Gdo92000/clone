import { createContext, useContext } from 'react';
import type { IAuthProvider } from './contracts/IAuthProvider';

export interface AuthContextValue {
  provider: IAuthProvider;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthProvider(): IAuthProvider {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthProvider must be used within <AuthProvider>');
  }
  return ctx.provider;
}