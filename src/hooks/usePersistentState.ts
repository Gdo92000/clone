import { useEffect, useState } from 'react';
import { readLocalStore, writeLocalStore } from '../services/localStore';

export function usePersistentState<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(() => readLocalStore(key, fallback));

  useEffect(() => {
    writeLocalStore(key, value);
  }, [key, value]);

  return [value, setValue] as const;
}
