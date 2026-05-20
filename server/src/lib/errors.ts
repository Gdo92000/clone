import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { logger } from './logger';

export class AppError extends Error {
  statusCode: ContentfulStatusCode;
  details?: unknown;

  constructor(statusCode: ContentfulStatusCode, message: string, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
  }
}

export function notFound(message = 'Registro não encontrado') {
  return new AppError(404, message);
}

export function badRequest(message: string, details?: unknown) {
  return new AppError(400, message, details);
}

export function conflict(message: string) {
  return new AppError(409, message);
}

export function unauthorized(message = 'Não autorizado') {
  return new AppError(401, message);
}

export const errorHandler: ErrorHandler = (err, c) => {
  const reqId: string | undefined = (() => {
    try { return c.get('requestId') as string | undefined; } catch { return undefined; }
  })();

  if (err instanceof AppError) {
    if (err.statusCode >= 500) logger.error(err.message, err, { requestId: reqId });
    return c.json({ error: err.message, details: err.details, requestId: reqId }, err.statusCode);
  }


  if (err instanceof HTTPException) {
    const status = err.status;
    const message = err.res ? 'Unauthorized' : err.message || 'Erro interno';
    if (status >= 500) logger.error(err.message, err, { requestId: reqId, status });
    return c.json({ error: message, requestId: reqId }, status);
  }


  const isZodError = typeof err === 'object' && err !== null && (err as { name?: string }).name === 'ZodError';
  if (isZodError) {
    const issues = (err as { issues: unknown[] }).issues;
    logger.warn('Zod validation error', { requestId: reqId, issues });
    return c.json({ error: 'Dados inválidos', details: issues, requestId: reqId }, 400);
  }


  const isPostgresError = typeof err === 'object' && err !== null && 'code' in err;
  if (isPostgresError) {
    const pgErr = err as { code: string; message?: string };
    if (pgErr.code === 'ECONNREFUSED' || pgErr.code === '57P01') {
      logger.error('DB connection error', err, { requestId: reqId, code: pgErr.code });
      return c.json({ error: 'Erro de conexão com banco de dados', requestId: reqId }, 503);
    }
    if (pgErr.code === '23505') {
      return c.json({ error: 'Registro duplicado', requestId: reqId }, 409);
    }
    logger.error('DB query error', err, { requestId: reqId, code: pgErr.code });
    return c.json({ error: 'Erro no banco de dados', requestId: reqId }, 500);
  }


  logger.error('Unhandled error', err instanceof Error ? err : new Error(String(err)), { requestId: reqId });
  return c.json({ error: 'Erro interno do servidor', requestId: reqId }, 500);
};
