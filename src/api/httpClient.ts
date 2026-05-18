const BASE_URL = (import.meta.env as Record<string, string | undefined>)['VITE_API_URL'] ?? '/api';
import { getToken, clearAuth } from '../services/authService';
import { ROUTES } from '../lib/routes';


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

  const res = await fetch(`${BASE_URL}${path}`, {
    headers, signal: AbortSignal.timeout(15000), ...options,
  });

  if (res.status === 401 && retry) {
    clearAuth();
    window.location.href = ROUTES.SESSION;
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