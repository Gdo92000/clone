import type { PermissionKey, UserRole } from 'src/modules/auth/types';
import { rolePermissions } from 'src/modules/auth/authData';
import type { IAuthProvider } from 'src/auth/contracts/IAuthProvider';
import { MOCK_USERS, MOCK_ACTIVE_USER_KEY } from 'src/auth/dev-mock-data';
import type { MockUser } from 'src/auth/dev-mock-data';

export class DevAuthProvider implements IAuthProvider {
  readonly name = 'dev' as const;

  getUser(): MockUser | null {
    const stored = this.getStored();
    return stored ?? MOCK_USERS[0] ?? null;
  }

  getUsers(): MockUser[] {
    return MOCK_USERS;
  }

  hasRole(roles: UserRole[]): boolean {
    const user = this.getUser();
    return !!user && roles.includes(user.role);
  }

  hasPermission(permission: PermissionKey): boolean {
    const user = this.getUser();
    return !!user && (rolePermissions[user.role] as readonly PermissionKey[]).includes(permission);
  }

  loginAs(userId: string): void {
    try {
      localStorage.setItem(MOCK_ACTIVE_USER_KEY, userId);
    } catch { /* storage unavailable */ }
  }

  async logout(): Promise<void> {
    try {
      localStorage.removeItem(MOCK_ACTIVE_USER_KEY);
    } catch { /* storage unavailable */ }
    return Promise.resolve();
  }

  getToken(): string | null {
    return 'dev-mock-token';
  }

  getRefreshToken(): string | null {
    return 'dev-mock-refresh-token';
  }

  initAuth(): void {
    const stored = this.getStored();
    if (!stored) {
      try {
        const first = MOCK_USERS[0];
        if (first) localStorage.setItem(MOCK_ACTIVE_USER_KEY, first.id);
      } catch { /* storage unavailable */ }
    }
  }

  private getStored(): MockUser | null {
    try {
      const userId = localStorage.getItem(MOCK_ACTIVE_USER_KEY);
      if (!userId) return null;
      return MOCK_USERS.find((u) => u.id === userId) ?? null;
    } catch {
      return null;
    }
  }
}