import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { authUserListDtoToModel } from '../../mappers/authMapper';
import { authKeys } from '../../api/queryKeys';
import { rolePermissions } from './authData';
import * as authService from '../../services/authService';
import type { AuthSession, AuthUser, PermissionKey, UserRole } from './types';

const defaultSession: AuthSession = { userId: '' };

export function useAuthSession() {
  const { data: users = [] } = useQuery({
    queryKey: authKeys.users,
    queryFn: () => authApi.getUsers().then(authUserListDtoToModel),
  });

  const [session, setSession] = useState<AuthSession>(defaultSession);

  const currentUser = authService.getStoredUser();

  const setUsers: React.Dispatch<React.SetStateAction<AuthUser[]>> = () => {};

  const loginAs = (userId: string) => {
    setSession({ userId });
  };

  const logout = () => {
    void authService.logout();
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
