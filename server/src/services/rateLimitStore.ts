export interface RateLimitStore {
  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }>;
}

export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  increment(key: string, windowMs: number): Promise<{ count: number; resetAt: number }> {
    const now = Date.now();
    const existing = this.store.get(key);
    const entry = existing && now <= existing.resetAt ? existing : { count: 0, resetAt: now + windowMs };
    this.store.set(key, entry);
    entry.count++;
    return Promise.resolve({ count: entry.count, resetAt: entry.resetAt });
  }

  private startCleanup() {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      for (const [key, entry] of this.store) {
        if (now > entry.resetAt) this.store.delete(key);
      }
    }, 60_000);
    this.cleanupInterval.unref();
  }
}
