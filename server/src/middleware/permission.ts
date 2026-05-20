import type { MiddlewareHandler } from 'hono';
import { getTokenPayload } from './auth';
import { createAuditLog } from '../services/auditLogService';

import type { MiddlewareHandler } from 'hono';
import { getTokenPayload } from './auth';
import { createAuditLog } from '../services/auditLogService';
import { db } from '../db';
import { rolePermissions } from '../db/schema';
import { eq, and } from 'drizzle-orm';

export function requirePermission(options: { roles?: string[]; permission?: string }): MiddlewareHandler {
  return async (c, next) => {
    const payload = getTokenPayload(c);
    if (!payload) {
      await createAuditLog({ action: 'AUTH_FAILED', metadata: { path: c.req.path, method: c.req.method, reason: 'no_token' } }).catch(() => {});
      return c.json({ error: 'Não autenticado' }, 401);
    }

    if (payload.role === 'superadmin') {
      return await next();
    }

    const { roles, permission } = options;

    // Check legacy roles if provided
    if (roles && roles.length > 0 && roles.includes(payload.role)) {
      return await next();
    }

    // Check granular permission if provided
    if (permission) {
      const hasPermission = await db.select()
        .from(rolePermissions)
        .where(and(eq(rolePermissions.role, payload.role), eq(rolePermissions.permission_id, permission)))
        .limit(1);

      if (hasPermission.length > 0) {
        return await next();
      }
    }

    await createAuditLog({
      userId: payload.sub,
      action: 'AUTH_FAILED',
      metadata: { path: c.req.path, method: c.req.method, reason: 'wrong_role_or_permission', required: options, actual: payload.role },
    }).catch(() => {});
    return c.json({ error: 'Acesso não autorizado' }, 403);
  };
}

