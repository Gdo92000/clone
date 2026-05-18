import { toast as sonnerToast } from 'sonner';
import { isDuplicate, enqueue } from './toastQueue';

type ToastType = 'success' | 'error' | 'info' | 'warning';

const TOAST_FN: Record<ToastType, (msg: string, opts?: Record<string, unknown>) => string | number> = {
  success: sonnerToast.success,
  error: sonnerToast.error,
  info: sonnerToast.info,
  warning: sonnerToast.warning,
};

interface ToastOptions {
  description?: string;
  duration?: number;
  id?: string;
}

function show(type: ToastType, message: string, options?: ToastOptions): void {
  if (isDuplicate(message)) return;
  enqueue(message, type);
  TOAST_FN[type](message, {
    description: options?.description,
    duration: options?.duration ?? (type === 'error' ? 6000 : 4000),
    id: options?.id,
  });
}

export function successToast(message: string, options?: ToastOptions): void {
  show('success', message, options);
}

export function errorToast(message: string, options?: ToastOptions): void {
  show('error', message, options);
}

export function infoToast(message: string, options?: ToastOptions): void {
  show('info', message, options);
}

export function warningToast(message: string, options?: ToastOptions): void {
  show('warning', message, options);
}

export function loadingToast(message: string): string {
  return String(sonnerToast.loading(message));
}

export function dismissToast(id: string | number): void {
  sonnerToast.dismiss(id);
}

export function promiseToast<T>(
  promise: Promise<T>,
  messages: {
    loading: string;
    success: string | ((data: T) => string);
    error: string | ((error: unknown) => string);
  },
): Promise<T | undefined> {
  sonnerToast.promise(promise, {
    loading: messages.loading,
    success: (data: T) => {
      const msg = typeof messages.success === 'function' ? messages.success(data) : messages.success;
      enqueue(msg, 'success');
      return msg;
    },
    error: (err: unknown) => {
      const msg = typeof messages.error === 'function' ? messages.error(err) : messages.error;
      enqueue(msg, 'error');
      return msg;
    },
  });
  return promise.then((data) => data).catch(() => undefined);
}

const HTTP_ERROR_MAP: Record<number, string> = {
  401: 'Sessão expirada. Faça login novamente.',
  403: 'Você não tem permissão para esta ação.',
  404: 'Recurso não encontrado.',
};

function fromHttpError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const withResponse = error as { response?: { status?: number; data?: { message?: string } } };
  const status = withResponse.response?.status;
  if (!status) return undefined;

  const known = HTTP_ERROR_MAP[status];
  if (known) return known;
  if (status >= 500) return 'Erro interno do servidor. Tente novamente.';

  return withResponse.response?.data?.message;
}

function fromNetworkError(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  if ('request' in error && !('response' in error)) {
    return 'Sem resposta do servidor. Verifique sua conexão.';
  }
  return undefined;
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof TypeError && error.message === 'Failed to fetch') {
    return 'Sem conexão com o servidor. Verifique sua internet.';
  }
  if (error instanceof DOMException && error.name === 'AbortError') return '';
  if (error instanceof Error) return error.message;

  return fromHttpError(error) ?? fromNetworkError(error) ?? fallback;
}

export function showErrorFromApi(error: unknown, fallback?: string): void {
  const message = getErrorMessage(error, fallback ?? 'Ocorreu um erro inesperado.');
  if (message) show('error', message);
}