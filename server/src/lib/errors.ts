import type { ErrorHandler } from 'hono';
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

function isPostgresError(err: unknown): err is { code: string; message?: string } {
  return typeof err === 'object' && err !== null && 'code' in err;
}

function isZodError(err: unknown): err is { name: string; issues: unknown[] } {
  return typeof err === 'object' && err !== null && (err as { name?: string }).name === 'ZodError';
}

export const errorHandler: ErrorHandler = (err, c) => {
  if (err instanceof AppError) {
    return c.json({ error: err.message, details: err.details }, err.statusCode);
  }

  if (isZodError(err)) {
    console.error('[Zod] Validation error:', err.issues);
    return c.json({ error: 'Dados inválidos', details: err.issues }, 400);
  }

  if (isPostgresError(err)) {
    if (err.code === 'ECONNREFUSED' || err.code === '57P01') {
      console.error('[DB] Connection error:', err.message ?? err.code);
      return c.json({ error: 'Erro de conexão com banco de dados' }, 503);
    }
    if (err.code === '23505') {
      console.error('[DB] Unique constraint violation:', err.message);
      return c.json({ error: 'Registro duplicado' }, 409);
    }
    console.error('[DB] Query error:', err.message ?? err.code);
    return c.json({ error: 'Erro no banco de dados' }, 500);
  }

  console.error(`[${c.req.method} ${c.req.path}] Unhandled error:`, err);
  return c.json({ error: 'Erro interno do servidor' }, 500);
};
