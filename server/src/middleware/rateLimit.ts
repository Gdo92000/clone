import type { MiddlewareHandler } from 'hono';
import { InMemoryRateLimitStore } from '../services/rateLimitStore';
import { RedisRateLimitStore } from '../services/redisRateLimitStore';
import { REDIS_URL } from '../config';

const store = REDIS_URL
  ? new RedisRateLimitStore(REDIS_URL)
  : new InMemoryRateLimitStore();

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

export function rateLimit(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS): MiddlewareHandler {
  return async (c, next) => {
    const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip') ?? 'unknown';
    const key = `${ip}:${c.req.path}`;

    const { count, resetAt } = await store.increment(key, windowMs);

    c.header('X-RateLimit-Limit', String(maxRequests));
    c.header('X-RateLimit-Remaining', String(Math.max(0, maxRequests - count)));
    c.header('X-RateLimit-Reset', String(Math.ceil(resetAt / 1000)));

    if (count > maxRequests) {
      return c.json({ error: 'Muitas requisições. Tente novamente mais tarde.' }, 429);
    }

    await next();
  };
}
