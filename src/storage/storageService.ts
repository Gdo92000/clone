const PREFIX = 'fluxds-';

function getKey(key: string): string {
  return `${PREFIX}${key}`;
}

export const storageService = {
  get(key: string): unknown {
    try {
      const raw = localStorage.getItem(getKey(key));
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  set(key: string, value: unknown): void {
    try { localStorage.setItem(getKey(key), JSON.stringify(value)); } catch { /* quota */ }
  },

  remove(key: string): void {
    try { localStorage.removeItem(getKey(key)); } catch { /* ignore */ }
  },

  getItem(key: string): string | null {
    try { return localStorage.getItem(getKey(key)); } catch { return null; }
  },

  setItem(key: string, value: string): void {
    try { localStorage.setItem(getKey(key), value); } catch { /* quota */ }
  },
};