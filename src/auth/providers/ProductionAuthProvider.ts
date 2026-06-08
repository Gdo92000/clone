import type { PermissionKey, UserRole } from 'src/modules/auth/types';
import { rolePermissions } from 'src/modules/auth/authData';
import type { IAuthProvider } from 'src/auth/contracts/IAuthProvider';
import * as authService from 'src/services/authService';

export class ProductionAuthProvider implements IAuthProvider {
  readonly name = 'production' as const;

  getUser() {
    return authService.getStoredUser();
  }

  getUsers() {
    return [];
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getUser();
    return !!user && roles.includes(user.role);
  }

  hasPermission(permission: PermissionKey): boolean {
    const user = this.getUser();
    return !!user && (rolePermissions[user.role] as readonly PermissionKey[]).includes(permission);
  }

  loginAs(_userId: string): void {
    /* no-op in production — real login required */
  }

  async logout(): Promise<void> {
    await authService.logout();
  }

  getToken(): string | null {
    return authService.getToken();
  }

  getRefreshToken(): string | null {
    return authService.getRefreshToken();
  }

  initAuth(): void {
    authService.initAuthSync();
  }
}