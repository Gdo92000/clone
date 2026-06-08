import { useContext } from 'react';
import { OnlineStatusContext, type OnlineStatusContextValue } from '../providers/onlineStatusContext';

export function useOnlineStatus(): OnlineStatusContextValue {
  return useContext(OnlineStatusContext);
}
