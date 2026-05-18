import { useState, useEffect, useCallback, useRef } from 'react';

interface NetworkStatus {
  isOnline: boolean;
  wasOffline: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [isOnline, setIsOnline] = useState(
    () => typeof navigator === 'undefined' || navigator.onLine,
  );
  const [justRestored, setJustRestored] = useState(false);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleOnline = useCallback(() => {
    setIsOnline(true);
    setJustRestored(true);
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    restoreTimerRef.current = setTimeout(() => {
      setJustRestored(false);
    }, 3000);
  }, []);

  const handleOffline = useCallback(() => {
    setIsOnline(false);
    setJustRestored(false);
    if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, [handleOnline, handleOffline]);

  return { isOnline, wasOffline: justRestored };
}