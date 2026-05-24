/** health.runtime.ts — health endpoints prontos para usar no EnvironmentRuntime */
import type { HealthStatus } from '../lib/health';
import { checkHealth, READY_STATE } from '../lib/health';

export async function healthz(): Promise<HealthStatus> {
  return checkHealth();
}

export async function liveness(): Promise<{ status: 'ok'; timestamp: string }> {
  return { status: 'ok', timestamp: new Date().toISOString() };
}

export async function readiness(): Promise<HealthStatus> {
  const result = await checkHealth();
  if (result.database === 'down') {
    return { ...result, status: 'degraded' };
  }
  return result;
}

export { READY_STATE };
