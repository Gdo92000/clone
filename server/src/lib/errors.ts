import type { ErrorHandler } from 'hono';
import { HTTPException } from 'hono/http-exception';
import type { ContentfulStatusCode } from 'hono/utils/http-status';

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
    if (err.statusCode >= 500) console.error(`[${reqId ?? '-'}] AppError:`, err.message);
    return c.json({ error: err.message, details: err.details, requestId: reqId }, err.statusCode);
  }

  if (err instanceof HTTPException) {
    const status = err.status;
    const message = err.res ? 'Unauthorized' : err.message || 'Erro interno';
    if (status >= 500) console.error(`[${reqId ?? '-'}] HTTP ${status}:`, err.message);
    return c.json({ error: message, requestId: reqId }, status);
  }

  const isZodError = typeof err === 'object' && err !== null && (err as { name?: string }).name === 'ZodError';
  if (isZodError) {
    const issues = (err as { issues: unknown[] }).issues;
    console.error(`[${reqId ?? '-'}] Zod validation error`);
    return c.json({ error: 'Dados inválidos', details: issues, requestId: reqId }, 400);
  }

  const isPostgresError = typeof err === 'object' && err !== null && 'code' in err;
  if (isPostgresError) {
    const pgErr = err as { code: string; message?: string };
    if (pgErr.code === 'ECONNREFUSED' || pgErr.code === '57P01') {
      console.error(`[${reqId ?? '-'}] DB connection error`);
      return c.json({ error: 'Erro de conexão com banco de dados', requestId: reqId }, 503);
    }
    if (pgErr.code === '23505') {
      return c.json({ error: 'Registro duplicado', requestId: reqId }, 409);
    }
    console.error(`[${reqId ?? '-'}] DB query error`);
    return c.json({ error: 'Erro no banco de dados', requestId: reqId }, 500);
  }

  console.error(`[${reqId ?? '-'}] Unhandled error:`, err instanceof Error ? err.message : err);
  return c.json({ error: 'Erro interno do servidor', requestId: reqId }, 500);
};
