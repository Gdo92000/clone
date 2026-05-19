import { storageService } from '../storage/storageService';
import { authApi } from '../api';
import { authUserDtoToModel } from '../mappers/authMapper';
import type { AuthUser } from '../modules/auth/types';

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';
const USER_KEY = 'auth-user';

export interface LoginInput {
  email: string;
  password: string;
}

export async function login(input: LoginInput): Promise<AuthUser> {
  const result = await authApi.login(input.email, input.password);
  const user = authUserDtoToModel(result.user);

  storageService.set(TOKEN_KEY, result.token);
  if (result.refreshToken) storageService.set(REFRESH_TOKEN_KEY, result.refreshToken);
  storageService.set(USER_KEY, user);
  return user;
}

export async function logout(): Promise<void> {
  try { await authApi.logout(); } catch { /* best-effort */ }
  storageService.remove(TOKEN_KEY);
  storageService.remove(REFRESH_TOKEN_KEY);
  storageService.remove(USER_KEY);
}

export function getToken(): string | null {
  return storageService.getItem(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return storageService.getItem(REFRESH_TOKEN_KEY);
}

export function setToken(token: string): void {
  storageService.set(TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  return storageService.get(USER_KEY) as AuthUser | null;
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function clearAuth(): void {
  storageService.remove(TOKEN_KEY);
  storageService.remove(REFRESH_TOKEN_KEY);
  storageService.remove(USER_KEY);
}
