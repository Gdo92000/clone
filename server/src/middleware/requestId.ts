import type { MiddlewareHandler } from 'hono';
import crypto from 'node:crypto';

export const requestId: MiddlewareHandler = async (c, next) => {
  const fromClient = c.req.header('X-Request-Id');
  const id = fromClient ?? crypto.randomUUID().slice(0, 8);
  c.set('requestId', id);
  c.header('X-Request-Id', id);
  await next();
};
