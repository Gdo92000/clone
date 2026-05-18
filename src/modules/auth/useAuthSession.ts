import { useMemo } from 'react';
import { usePersistentState } from '../../hooks/usePersistentState';
import { authUsers, rolePermissions } from './authData';
import type { AuthSession, AuthUser, PermissionKey, UserRole } from './types';

const defaultSession: AuthSession = { userId: 'user-superadmin' };

export function useAuthSession() {
  const [users, setUsers] = usePersistentState<AuthUser[]>('auth.users', authUsers);
  const [session, setSession] = usePersistentState<AuthSession>('auth.session', defaultSession);

  const currentUser = useMemo(
    () => users.find((user) => user.id === session.userId && user.active) ?? users[0],
    [session.userId, users]
  );

  const loginAs = (userId: string) => {
    setSession({ userId });
  };

  const logout = () => {
    setSession(defaultSession);
  };

  const hasRole = (roles: UserRole[]) => !!currentUser && roles.includes(currentUser.role);
  const hasPermission = (permission: PermissionKey) =>
    !!currentUser && rolePermissions[currentUser.role].includes(permission);

  return {
    users,
    setUsers,
    session,
    currentUser,
    loginAs,
    logout,
    hasRole,
    hasPermission,
  };
}
