import { createContext } from 'react';

export interface OnlineStatusContextValue {
  isOnline: boolean;
  wasOffline: boolean;
}

export const OnlineStatusContext = createContext<OnlineStatusContextValue>({
  isOnline: true,
  wasOffline: false,
});
