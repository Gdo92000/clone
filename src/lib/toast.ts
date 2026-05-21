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

