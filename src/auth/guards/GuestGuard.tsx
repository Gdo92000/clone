import type { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

interface GuestGuardProps {
  children: ReactNode;
  allowAuthenticated?: boolean;
}

export function GuestGuard({ children, allowAuthenticated = true }: GuestGuardProps) {
  const { user } = useAuth();

  if (user && allowAuthenticated) {
    return <>{children}</>;
  }

  if (!user) {
    return <>{children}</>;
  }

  return null;
}