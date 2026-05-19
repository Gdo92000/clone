import Redis from 'ioredis';
import type { RateLimitStore } from './rateLimitStore';

export class RedisRateLimitStore implements RateLimitStore {
  private redis: Redis;

  constructor(redisUrl: string) {
    this.redis = new Redis(redisUrl, {
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      retryStrategy: (times) => (times > 3 ? null : Math.min(times * 100, 1000)),
    });
  }

  async increment(key: string, windowMs: number) {
    const now = Date.now();
    const resetAt = now + windowMs;
    const windowKey = Math.floor(now / windowMs);
    const redisKey = `ratelimit:${key}:${windowKey}`;

    const count = await this.redis.incr(redisKey);
    if (count === 1) {
      await this.redis.pexpire(redisKey, windowMs);
    }

    return { count, resetAt };
  }

  async quit() {
    await this.redis.quit();
  }
}
