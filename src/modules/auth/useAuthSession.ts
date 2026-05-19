import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../../api/authApi';
import { authUserListDtoToModel } from '../../mappers/authMapper';
import * as authService from '../../services/authService';
import type { AuthSession, AuthUser, PermissionKey, UserRole } from './types';

const rolePermissions: Record<string, string[]> = {
  customer: ['view_menu', 'order', 'favorite'],
  merchant: ['view_menu', 'manage_menu', 'manage_orders', 'manage_branches', 'view_reports', 'manage_coupons', 'manage_team', 'manage_subscription', 'manage_hours'],
  courier: ['view_deliveries', 'accept_delivery', 'update_delivery'],
  admin: ['manage_companies', 'manage_users', 'manage_coverage', 'view_reports', 'manage_coupons'],
  superadmin: ['manage_companies', 'manage_users', 'manage_coverage', 'view_reports', 'manage_coupons', 'manage_plans', 'manage_billing', 'manage_feature_flags', 'manage_notifications', 'view_audit', 'manage_support'],
};

const defaultSession: AuthSession = { userId: '' };

export function useAuthSession() {
  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: () => authApi.getUsers().then(authUserListDtoToModel),
  });

  const [session, setSession] = useState<AuthSession>(defaultSession);

  const currentUser = authService.getStoredUser();

  const setUsers: React.Dispatch<React.SetStateAction<AuthUser[]>> = () => {};

  const loginAs = (userId: string) => {
    setSession({ userId });
  };

  const logout = () => {
    authService.logout();
  };

  const hasRole = (roles: UserRole[]) => !!currentUser && roles.includes(currentUser.role);
  const hasPermission = (permission: PermissionKey) =>
    !!currentUser && rolePermissions[currentUser.role]?.includes(permission);

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
