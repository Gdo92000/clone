import { useState, useCallback } from 'react';
import { useAuthProvider } from '../context';

export function useAuth() {
  const provider = useAuthProvider();
  const [, setTick] = useState(0);

  const refresh = useCallback(() => { setTick((t) => t + 1); }, []);

  return {
    user: provider.getUser(),
    users: provider.getUsers(),
    isAuthenticated: provider.getUser() !== null,
    loginAs: (userId: string) => { provider.loginAs(userId); refresh(); },
    logout: async () => { await provider.logout(); refresh(); },
  };
}