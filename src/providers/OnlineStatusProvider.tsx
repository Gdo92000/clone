import type { ReactNode } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { OnlineStatusContext } from './onlineStatusContext';

export function OnlineStatusProvider({ children }: { children: ReactNode }) {
  const { isOnline, wasOffline } = useNetworkStatus();

  return (
    <OnlineStatusContext.Provider value={{ isOnline, wasOffline }}>
      {!isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-feedback-error text-white text-center py-2 px-4 text-sm font-medium shadow-lg">
          Sem conexão com a internet. Algumas funcionalidades podem estar indisponíveis.
        </div>
      )}
      {wasOffline && isOnline && (
        <div className="fixed top-0 left-0 right-0 z-[9999] bg-green-600 text-white text-center py-2 px-4 text-sm font-medium shadow-lg animate-fade-out">
          Conexão restaurada.
        </div>
      )}
      {children}
    </OnlineStatusContext.Provider>
  );
}
