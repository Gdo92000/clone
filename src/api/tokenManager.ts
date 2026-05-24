import type { AuthUser } from '../modules/auth/types';

const TOKEN_KEY = 'auth-token';
const REFRESH_TOKEN_KEY = 'auth-refresh-token';
const USER_KEY = 'auth-user';

function prefix(key: string): string {
  return `fluxds-${key}`;
}

function safeGet(key: string): string | null {
  try { return sessionStorage.getItem(prefix(key)); } catch { return null; }
}

function safeSet(key: string, value: string): void {
  try { sessionStorage.setItem(prefix(key), value); } catch { /* quota */ }
}

function safeRemove(key: string): void {
  try { sessionStorage.removeItem(prefix(key)); } catch { /* ignore */ }
}

function safeGetObj(key: string): unknown {
  try {
    const raw = sessionStorage.getItem(prefix(key));
    return raw ? JSON.parse(raw) as unknown : null;
  } catch { return null; }
}

function safeSetObj(key: string, value: unknown): void {
  try { sessionStorage.setItem(prefix(key), JSON.stringify(value)); } catch { /* quota */ }
}

export function getToken(): string | null {
  return safeGet(TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  return safeGet(REFRESH_TOKEN_KEY);
}

export function setToken(token: string): void {
  safeSet(TOKEN_KEY, token);
}

export function setRefreshToken(token: string): void {
  safeSet(REFRESH_TOKEN_KEY, token);
}

export function getStoredUser(): AuthUser | null {
  return safeGetObj(USER_KEY) as AuthUser | null;
}

export function setStoredUser(user: AuthUser): void {
  safeSetObj(USER_KEY, user);
}

export function clearAuth(): void {
  safeRemove(TOKEN_KEY);
  safeRemove(REFRESH_TOKEN_KEY);
  safeRemove(USER_KEY);
}
