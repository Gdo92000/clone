import crypto from 'node:crypto';
import { db } from '../db';
import { auditLogs } from '../db/schema';

export type AuditAction =
  | 'LOGIN_SUCCESS'
  | 'LOGIN_FAILED'
  | 'LOGOUT'
  | 'TOKEN_REFRESH'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET_REQUEST'
  | 'PASSWORD_RESET_CONFIRM'
  | 'REGISTER'
  | 'SESSION_REVOKED';

export async function createAuditLog(params: {
  userId?: string;
  action: AuditAction;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const { userId, action, entityType, entityId, metadata, ipAddress, userAgent } = params;
  await db.insert(auditLogs).values({
    id: crypto.randomUUID(),
    user_id: userId ?? null,
    action,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
    metadata: metadata ? JSON.stringify(metadata) : null,
    ip_address: ipAddress ?? null,
    user_agent: userAgent ?? null,
  });
}
