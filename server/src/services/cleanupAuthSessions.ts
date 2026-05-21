import { lt, isNotNull, and } from 'drizzle-orm';
import { db } from '../db';
import { authSessions } from '../db/schema';
import { logger } from '../lib/logger';

export async function cleanupAuthSessions(): Promise<void> {
  await db
    .delete(authSessions)
    .where(
      and(
        lt(authSessions.expires_at, new Date()),
        isNotNull(authSessions.revoked_at),
      ),
    );
}

const CLEANUP_INTERVAL_MS = 60 * 60 * 1000;

export function startSessionCleanup(intervalMs = CLEANUP_INTERVAL_MS): void {
  cleanupAuthSessions().catch((err: unknown) => { logger.error('Session cleanup failed on start', err); });
  setInterval(() => { cleanupAuthSessions().catch((err: unknown) => { logger.error('Session cleanup failed', err); }); }, intervalMs).unref();
}
