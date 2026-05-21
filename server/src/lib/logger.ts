import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL ?? (isDev ? 'debug' : 'info'),
  transport: isDev ? { target: 'pino-pretty' } : undefined,
});

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.info(meta ?? {}, message);
  },
  warn: (message: string, meta?: Record<string, unknown>) => {
    pinoLogger.warn(meta ?? {}, message);
  },
  error: (message: string, error?: unknown, meta?: Record<string, unknown>) => {
    if (error instanceof Error) {
      pinoLogger.error({ err: error, ...meta }, message);
    } else if (error && typeof error === 'object') {
      pinoLogger.error({ ...(error as Record<string, unknown>), ...meta }, message);
    } else {
      pinoLogger.error(meta ?? {}, message);
    }
  },
};
