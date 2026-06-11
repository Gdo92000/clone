import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockRedis = vi.hoisted(() => ({
  incr: vi.fn(),
  pexpire: vi.fn(),
  quit: vi.fn(),
}));

vi.mock('ioredis', () => ({ default: vi.fn(function () { return mockRedis; }) }));

describe('RedisRateLimitStore', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('increment creates new window', async () => {
    mockRedis.incr.mockResolvedValue(1);
    mockRedis.pexpire.mockResolvedValue(1);
    const { RedisRateLimitStore } = await import('./redisRateLimitStore');
    const store = new RedisRateLimitStore('redis://localhost:6379');
    const result = await store.increment('test-key', 60000);
    expect(result.count).toBe(1);
    expect(mockRedis.pexpire).toHaveBeenCalled();
  });

  it('increment reuses existing window', async () => {
    mockRedis.incr.mockResolvedValue(5);
    const { RedisRateLimitStore } = await import('./redisRateLimitStore');
    const store = new RedisRateLimitStore('redis://localhost:6379');
    const result = await store.increment('test-key', 60000);
    expect(result.count).toBe(5);
    expect(mockRedis.pexpire).not.toHaveBeenCalled();
  });

  it('quit calls redis.quit', async () => {
    mockRedis.quit.mockResolvedValue(undefined);
    const { RedisRateLimitStore } = await import('./redisRateLimitStore');
    const store = new RedisRateLimitStore('redis://localhost:6379');
    await store.quit();
    expect(mockRedis.quit).toHaveBeenCalled();
  });
});
