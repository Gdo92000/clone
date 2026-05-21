type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LEVEL_PRIORITY: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const currentLevel: LogLevel =
  (import.meta.env as Record<string, string | undefined>)['VITE_LOG_LEVEL'] as LogLevel | undefined
  ?? (import.meta.env.DEV ? 'debug' : 'warn');

function shouldLog(level: LogLevel): boolean {
  return LEVEL_PRIORITY[level] >= LEVEL_PRIORITY[currentLevel];
}

function formatMessage(level: LogLevel, context: string, message: string): string {
  return `[${level.toUpperCase()}] [${context}] ${message}`;
}

export const logger = {
  debug(context: string, message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('debug')) {
      console.warn(formatMessage('debug', context, message), meta ?? '');
    }
  },

  info(context: string, message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('info')) {
      console.warn(formatMessage('info', context, message), meta ?? '');
    }
  },

  warn(context: string, message: string, meta?: Record<string, unknown>): void {
    if (shouldLog('warn')) {
      console.warn(formatMessage('warn', context, message), meta ?? '');
    }
  },

  error(context: string, message: string, error?: unknown, meta?: Record<string, unknown>): void {
    if (!shouldLog('error')) return;

    const base = formatMessage('error', context, message);
    if (error instanceof Error) {
      console.error(base, { name: error.name, message: error.message, stack: error.stack, ...meta });
    } else if (error && typeof error === 'object') {
      console.error(base, { ...(error as Record<string, unknown>), ...meta });
    } else {
      console.error(base, meta ?? '');
    }
  },
};
