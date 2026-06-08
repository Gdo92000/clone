import { useMemo, type ReactNode } from 'react';
import { AuthContext } from './context';
import { DevAuthProvider } from './providers/DevAuthProvider';
import { ProductionAuthProvider } from './providers/ProductionAuthProvider';

interface AuthProviderProps {
  children: ReactNode;
  provider?: 'dev' | 'production';
}

export function AuthProvider({ children, provider: providerType }: AuthProviderProps) {
  const provider = useMemo(() => {
    if (providerType === 'production') {
      return new ProductionAuthProvider();
    }
    return new DevAuthProvider();
  }, [providerType]);

  provider.initAuth();

  return (
    <AuthContext.Provider value={{ provider }}>
      {children}
    </AuthContext.Provider>
  );
}