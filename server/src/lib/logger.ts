import pino from 'pino';
import { getRequestStore } from './requestContext';
import { LOG_LEVEL, NODE_ENV } from '../config';

const isDev = NODE_ENV !== 'production';

const pinoLogger = pino({
  level: LOG_LEVEL,
  transport: isDev ? { target: 'pino-pretty' } : undefined,
});

function withRequestContext(meta?: Record<string, unknown>): Record<string, unknown> {
  const store = getRequestStore();
  if (!store) return meta ?? {};
  return { requestId: store.requestId, userId: store.userId, tenantId: store.tenantId, ...meta };
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.info(withRequestContext(meta), message);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.warn(withRequestContext(meta), message);
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    const ctx = withRequestContext(meta);
    if (error instanceof Error) {
      pinoLogger.error({ err: error, ...ctx }, message);
    } else if (error && typeof error === 'object') {
      pinoLogger.error({ ...(error as Record<string, unknown>), ...ctx }, message);
    } else {
      pinoLogger.error(ctx, message);
    }
  },
};
