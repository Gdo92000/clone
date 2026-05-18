import { useState, useCallback } from 'react';
import { clsx } from 'clsx';
import { Icon } from './Icon';

interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

let toastId = 0;

export function useToast() {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const show = useCallback((message: string, type: ToastData['type'] = 'info') => {
    const id = ++toastId;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => { setToasts((prev) => prev.filter((t) => t.id !== id)); }, 3000);
  }, []);

  const ToastContainer = toasts.length > 0 ? (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={clsx(
          'flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium animate-[fade-in_0.2s_ease-out]',
          t.type === 'success' ? 'bg-feedback-success text-white' :
          t.type === 'error' ? 'bg-feedback-error text-white' :
          'bg-surface-inverse text-text-inverse'
        )}>
          <Icon name={t.type === 'success' ? 'CheckCircle' : t.type === 'error' ? 'AlertCircle' : 'Info'} size={16} />
          {t.message}
        </div>
      ))}
    </div>
  ) : null;

  return { show, ToastContainer };
}