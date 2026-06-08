import type { PermissionKey, UserRole } from 'src/modules/auth/types';

export interface IAuthProvider {
  readonly name: 'dev' | 'production';

  getUser(): { id: string; name: string; email: string; role: UserRole; companyId?: string; branchId?: string; avatarUrl: string; active: boolean } | null;
  getUsers(): { id: string; name: string; email: string; role: UserRole; companyId?: string; branchId?: string; avatarUrl: string; active: boolean }[];
  hasRole(roles: UserRole[]): boolean;
  hasPermission(permission: PermissionKey): boolean;
  loginAs(userId: string): void;
  logout(): Promise<void>;
  getToken(): string | null;
  getRefreshToken(): string | null;
  initAuth(): void;
}