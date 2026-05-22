import { getToken, getRefreshToken, setToken, clearAuth } from '../services/authService';
import { getLoginUrlForPath } from '../lib/routes';
import { logger } from '../lib/logger';

const BASE_URL = (import.meta.env as Record<string, string | undefined>)['VITE_API_URL'] ?? '/api';
const CLIENT_ID = crypto.randomUUID().slice(0, 8);
let requestCounter = 0;

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

const MAX_RETRIES = 2;
const RETRYABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

const inFlight = new Map<string, Promise<unknown>>();

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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

async function fetchWithRetry(path: string, options?: RequestInit, canRetryAuth = true): Promise<Response> {
  const token = getToken();
  const requestId = `${CLIENT_ID}-${++requestCounter}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'X-Request-Id': requestId,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      headers, signal: AbortSignal.timeout(15000), ...options,
    });
  } catch {
    logger.error('API', 'Network error', undefined, { path, baseUrl: BASE_URL, requestId });
    throw new ApiError(0, { message: 'Servidor indisponível. Verifique se o backend está rodando.' });
  }

  if (res.status === 401 && canRetryAuth && token) {
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
        return res;
      } catch (e) {
        if (e instanceof ApiError) throw e;
        throw new ApiError(0, { message: 'Erro de rede' });
      }
    }

    clearAuth();
    window.location.href = getLoginUrlForPath();
    throw new ApiError(401, { message: 'Sessão expirada' });
  }

  return res;
}

async function withDedup<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key);
  if (existing) return existing as Promise<T>;
  const promise = fn().finally(() => { inFlight.delete(key); });
  inFlight.set(key, promise);
  return promise;
}

async function request<T>(path: string, options?: RequestInit, retry = true): Promise<T> {
  let attempts = 0;
  const maxAttempts = retry ? 1 + MAX_RETRIES : 1;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      const res = await fetchWithRetry(path, options, attempts === 1);
      if (!res.ok) {
        if (attempts < maxAttempts && RETRYABLE_STATUSES.has(res.status)) {
          const backoff = Math.min(1000 * Math.pow(2, attempts - 1), 8000);
          await sleep(backoff);
          continue;
        }
        throw new ApiError(res.status, await res.json().catch(() => ({})));
      }
      return await res.json() as T;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        throw err;
      }
      if (err instanceof ApiError && !RETRYABLE_STATUSES.has(err.status) && err.status !== 0) {
        throw err;
      }
      if (attempts >= maxAttempts) {
        throw err;
      }
      const backoff = Math.min(1000 * Math.pow(2, attempts - 1), 8000);
      await sleep(backoff);
    }
  }
  throw new ApiError(0, { message: 'Max retries exceeded' });
}

export async function get<T>(path: string): Promise<T> {
  const dedupKey = `GET:${path}`;
  return withDedup(dedupKey, () => request<T>(path));
}

export async function post<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : null });
}

export async function put<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : null });
}

export async function patch<T>(path: string, body?: unknown): Promise<T> {
  return request<T>(path, { method: 'PATCH', body: body ? JSON.stringify(body) : null });
}

export async function del<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'DELETE' });
}

export const httpClient = { get, post, put, del };
