import { useAuthProvider } from '../context';
import type { PermissionKey, UserRole } from 'src/modules/auth/types';

export function usePermissions() {
  const provider = useAuthProvider();

  return {
    hasRole: (roles: UserRole[]) => provider.hasRole(roles),
    hasPermission: (permission: PermissionKey) => provider.hasPermission(permission),
  };
}