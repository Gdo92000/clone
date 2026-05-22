import type { MiddlewareHandler } from 'hono';
import { runWithStore } from '../lib/requestContext';
import type { TokenPayload } from '../auth/types';

export const requestContext: MiddlewareHandler = async (c, next) => {
  const requestId = (c.get('requestId') as string | undefined) ?? '';
  const payload = (() => {
    try { return c.get('jwtPayload') as TokenPayload | undefined; } catch { return undefined; }
  })();

  await runWithStore({
    requestId,
    userId: payload?.sub,
    tenantId: undefined,
  }, next);
};
