import type { MiddlewareHandler } from 'hono';
import { getTokenPayload } from './auth';
import { createAuditLog } from '../services/auditLogService';

export function requirePermission(roles?: string[]): MiddlewareHandler {
  return async (c, next) => {
    const payload = getTokenPayload(c);
    if (!payload) {
      await createAuditLog({ action: 'AUTH_FAILED', metadata: { path: c.req.path, method: c.req.method, reason: 'no_token' } }).catch(() => {});
      return c.json({ error: 'Não autenticado' }, 401);
    }

    if (roles && roles.length > 0 && !roles.includes(payload.role)) {
      await createAuditLog({
        userId: payload.sub,
        action: 'AUTH_FAILED',
        metadata: { path: c.req.path, method: c.req.method, reason: 'wrong_role', required: roles, actual: payload.role },
      }).catch(() => {});
      return c.json({ error: 'Acesso não autorizado' }, 403);
    }

    await next();
  };
}
