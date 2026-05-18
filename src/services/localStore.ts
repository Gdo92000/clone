import { storageService } from '../storage/storageService';

export function readLocalStore<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  return (storageService.get(key) as T | null) ?? fallback;
}

export function writeLocalStore(key: string, value: unknown): void {
  if (typeof window === 'undefined') return;
  storageService.set(key, value);
}