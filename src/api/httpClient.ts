import { getToken, getRefreshToken, setToken, clearAuth } from '../services/authService';
import { getLoginUrlForPath } from '../lib/routes';
import { logger } from '../lib/logger';

const BASE_URL = (import.meta.env as Record<string, string | undefined>)['VITE_API_URL'] ?? '/api';

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshToken(): Promise<boolean> {
  const stored = getRefreshToken();
  if (!stored) return false;

  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken: stored }),
    });
    if (!res.ok) return false;
    const data = await res.json() as { accessToken: string; expiresIn?: number };
    setToken(data.accessToken);
    return true;
  } catch (err) {
    logger.error('httpClient', 'Refresh token failed', err instanceof Error ? err : new Error('Unknown'));
    return false;
  }
}

export class ApiError extends Error {
  status: number;
  data: unknown;
  constructor(status: number, data: unknown) {
    super(`API Error: ${status}`);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers, signal: AbortSignal.timeout(15000), ...options,
    });
  } catch {
    logger.error('API', 'Network error', undefined, { path, baseUrl: BASE_URL });
    throw new ApiError(0, { message: 'Servidor indisponível. Verifique se o backend está rodando.' });
  }

  if (res.status === 401 && retry && token) {
    if (!isRefreshing) {
      isRefreshing = true;
      refreshPromise = tryRefreshToken().finally(() => { isRefreshing = false; refreshPromise = null; });
    }

    const refreshed = refreshPromise ? await refreshPromise : false;

    if (refreshed) {
      const newToken = getToken();
      if (newToken) headers['Authorization'] = `Bearer ${newToken}`;
      try {
        res = await fetch(`${BASE_URL}${path}`, {
          headers, signal: AbortSignal.timeout(15000), ...options,
        });
        if (!res.ok && res.status !== 401) {
          throw new ApiError(res.status, await res.json().catch(() => ({})));
        }
        if (res.status === 401) {
          clearAuth();
          window.location.href = getLoginUrlForPath();
          throw new ApiError(401, { message: 'Sessão expirada' });
          }
          return res.json() as Promise<T>;
        } catch (e) {
          if (e instanceof ApiError) throw e;
          throw new ApiError(0, { message: 'Erro de rede' });
        }
      }

      clearAuth();
      window.location.href = getLoginUrlForPath();
    throw new ApiError(401, { message: 'Sessão expirada' });
  }

  if (!res.ok) {
    throw new ApiError(res.status, await res.json().catch(() => ({})));
  }

  return res.json() as Promise<T>;
}

export async function get<T>(path: string): Promise<T> {
  return request<T>(path);
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : null });
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : null });
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export const httpClient = { get, post, put, del };
