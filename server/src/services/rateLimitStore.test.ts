import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InMemoryRateLimitStore } from './rateLimitStore';

describe('InMemoryRateLimitStore', () => {
  let store: InMemoryRateLimitStore;

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('increments count for new key', async () => {
    store = new InMemoryRateLimitStore();
    const result = await store.increment('key1', 60000);
    expect(result.count).toBe(1);
  });

  it('resets count after window expires', async () => {
    store = new InMemoryRateLimitStore();
    await store.increment('key1', 60000);
    vi.advanceTimersByTime(61000);
    const result = await store.increment('key1', 60000);
    expect(result.count).toBe(1);
  });

  it('accumulates count within window', async () => {
    store = new InMemoryRateLimitStore();
    await store.increment('key1', 60000);
    const result2 = await store.increment('key1', 60000);
    expect(result2.count).toBe(2);
  });
});
