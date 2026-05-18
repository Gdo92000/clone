import type { AxiosError, InternalAxiosRequestConfig } from 'axios';
import axios from 'axios';
import { showErrorFromApi } from './toast';

let lastErrorTime = 0;
const ERROR_DEDUP = 3000;

const ERROR_MESSAGES: Record<string, string> = {
  ERR_NETWORK: 'Sem conexão com o servidor. Verifique sua internet.',
  ECONNABORTED: 'Tempo limite excedido. Tente novamente.',
};

const HTTP_MESSAGES: Record<number, string> = {
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: '',
  500: 'Erro interno do servidor. Tente novamente.',
};

function showDedupedError(error: unknown): void {
  const now = Date.now();
  if (now - lastErrorTime < ERROR_DEDUP) return;
  lastErrorTime = now;
  showErrorFromApi(error);
}

export const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = typeof window !== 'undefined'
      ? localStorage.getItem('auth_token')
      : null;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error: Error) => {
    showDedupedError(error);
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const errorCode = error.code ?? '';
    const errorMessage = ERROR_MESSAGES[errorCode];

    if (errorMessage) {
      showDedupedError(new Error(errorMessage));
    } else if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        if (typeof window !== 'undefined') {
          localStorage.removeItem('auth_token');
        }
      }

      const httpMessage = HTTP_MESSAGES[status];
      if (httpMessage) {
        showDedupedError(new Error(httpMessage));
      } else if (status !== 404) {
        showDedupedError(error);
      }
    } else {
      showDedupedError(error);
    }

    return Promise.reject(error);
  },
);

export function setAuthToken(token: string | null): void {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}