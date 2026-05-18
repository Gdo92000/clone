import { storageService } from '../storage/storageService';
import { login as mockLogin, logout as mockLogout } from '../repositories/authRepository';
import { authApi } from '../api';
import { authUserDtoToModel } from '../mappers/authMapper';
import type { AuthUser } from '../modules/auth/types';

const TOKEN_KEY = 'auth-token';
const USER_KEY = 'auth-user';

const useMock = __USE_MOCK__;

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  let user: AuthUser;
  let token: string;

  if (useMock) {
    user = await mockLogin(input.email, input.password);
    token = 'mock-jwt-token';
  } else {
    const result = await authApi.login(input.email, input.password);
    user = authUserDtoToModel(result.user);
    token = result.token;
  }

  storageService.set(TOKEN_KEY, token);
  storageService.set(USER_KEY, user);
  return user;
}

export async function logout(): Promise<void> {
  if (!useMock) await mockLogout();
  storageService.remove(TOKEN_KEY);
  storageService.remove(USER_KEY);
}

export function getToken(): string | null {
  return storageService.getItem(TOKEN_KEY);
}

export function getStoredUser(): AuthUser | null {
  return storageService.get(USER_KEY) as AuthUser | null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  storageService.remove(TOKEN_KEY);
  storageService.remove(USER_KEY);
}