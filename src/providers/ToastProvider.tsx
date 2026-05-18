import { useEffect, useRef } from 'react';
import { Toaster } from 'sonner';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { successToast, errorToast } from '../lib/toast';

interface ToastProviderProps {
  children: React.ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const { isOnline, wasOffline } = useNetworkStatus();
  const hasShownOnlineRef = useRef(false);

  useEffect(() => {
    if (wasOffline && isOnline) {
      successToast('Conexão restaurada', { duration: 3000 });
      hasShownOnlineRef.current = true;
    } else if (!isOnline) {
      errorToast('Sem conexão com a internet', { duration: Infinity });
      hasShownOnlineRef.current = false;
    }
  }, [isOnline, wasOffline]);

  return (
    <>
      {children}
      <Toaster
        richColors
        closeButton
        visibleToasts={4}
        position="top-center"
        toastOptions={{
          className: 'backdrop-blur-md rounded-xl shadow-lg border border-border-default',
          duration: 4000,
        }}
      />
      <style>{`
        @media (min-width: 768px) {
          .sonner-toaster {
            bottom: 1rem !important;
            right: 1rem !important;
            top: auto !important;
            left: auto !important;
          }
        }

        .sonner-toast {
          --normal-bg: transparent !important;
          --normal-border: transparent !important;
          background: hsl(var(--surface-elevated)) !important;
          border: 1px solid hsl(var(--border-default)) !important;
          border-radius: 0.75rem !important;
          padding: 1rem !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
          font-family: inherit !important;
        }

        .sonner-toast[data-type="success"] {
          border-left: 3px solid #22c55e !important;
        }

        .sonner-toast[data-type="error"] {
          border-left: 3px solid #ef4444 !important;
        }

        .sonner-toast[data-type="info"] {
          border-left: 3px solid #3b82f6 !important;
        }

        .sonner-toast[data-type="warning"] {
          border-left: 3px solid #f59e0b !important;
        }

        .sonner-toast .sonner-toast-description {
          color: hsl(var(--text-secondary)) !important;
        }

        .sonner-toast [data-close-button] {
          background: hsl(var(--surface-background)) !important;
          border: 1px solid hsl(var(--border-default)) !important;
          border-radius: 9999px !important;
        }
      `}</style>
    </>
  );
}