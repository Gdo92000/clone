import { sql } from 'drizzle-orm';
import { db } from '../db';

export interface HealthStatus {
  status: 'ok' | 'degraded' | 'down';
  timestamp: string;
  uptime: number;
  database: 'ok' | 'down';
  requestId?: string;
}

export async function checkHealth(requestId?: string): Promise<HealthStatus> {
  let database: HealthStatus['database'] = 'ok';

  try {
    await db.execute(sql`SELECT 1`);
  } catch {
    database = 'down';
  }

  const status: HealthStatus['status'] = database === 'down' ? 'degraded' : 'ok';

  return {
    status,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database,
    requestId,
  };
}

export const READY_STATE = { ready: false };

export function isReady(): boolean {
  return READY_STATE.ready;
}
