import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { usePermissions } from '../hooks/usePermissions';
import { getLoginUrlForPath } from 'src/lib/routes';
import type { PermissionKey, UserRole } from 'src/modules/auth/types';

interface ProtectedGuardProps {
  roles?: UserRole[];
  permission?: PermissionKey;
  children: ReactNode;
}

export function ProtectedGuard({ roles, permission, children }: ProtectedGuardProps) {
  const { user } = useAuth();
  const { hasPermission, hasRole } = usePermissions();
  const location = useLocation();
  const loginUrl = getLoginUrlForPath(location.pathname);
  const roleAllowed = roles ? hasRole(roles) : true;
  const permissionAllowed = permission ? hasPermission(permission) : true;

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-background p-4">
        <div className="mx-auto max-w-xl rounded-xl border border-border-default bg-surface-elevated p-6 text-center">
          <h1 className="font-display text-2xl font-bold text-text-primary">Sessão expirada</h1>
          <p className="mt-2 text-sm text-text-secondary">Faça login novamente para continuar.</p>
          <Link to={loginUrl} className="mt-4 inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse">
            Ir para login
          </Link>
        </div>
      </div>
    );
  }

  if (roleAllowed && permissionAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-surface-background p-4">
      <div className="mx-auto max-w-xl rounded-xl border border-border-default bg-surface-elevated p-6 text-center">
        <h1 className="font-display text-2xl font-bold text-text-primary">Acesso bloqueado</h1>
        <p className="mt-2 text-sm text-text-secondary">
          Seu perfil atual não possui permissão para acessar esta área.
        </p>
        <Link to={loginUrl} className="mt-4 inline-flex rounded-lg bg-brand-primary px-4 py-2 text-sm font-semibold text-text-inverse">
          Trocar perfil
        </Link>
      </div>
    </div>
  );
}