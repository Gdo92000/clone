import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db', () => ({
  db: {
    execute: vi.fn().mockResolvedValue(undefined),
  },
}));

vi.mock('../lib/health', () => ({
  checkHealth: vi.fn().mockResolvedValue({ status: 'ok', timestamp: '2026-06-01T00:00:00.000Z', uptime: 100, database: 'ok' }),
  READY_STATE: { ready: false },
  isReady: vi.fn().mockReturnValue(false),
}));

describe('health.runtime', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('healthz returns health status', async () => {
    const { healthz } = await import('./health.runtime');
    const result = await healthz();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
  });

  it('liveness returns ok', async () => {
    const { liveness } = await import('./health.runtime');
    const result = liveness();
    expect(result.status).toBe('ok');
    expect(result.timestamp).toBeDefined();
  });

  it('readiness returns ok when database is up', async () => {
    const { readiness } = await import('./health.runtime');
    const result = await readiness();
    expect(result.status).toBe('ok');
  });

  it('readiness returns degraded when database is down', async () => {
    const healthModule = await import('../lib/health');
    vi.mocked(healthModule.checkHealth).mockResolvedValue({ status: 'degraded', timestamp: '2026-06-01T00:00:00.000Z', uptime: 100, database: 'down', requestId: undefined });
    const { readiness } = await import('./health.runtime');
    const result = await readiness();
    expect(result.status).toBe('degraded');
  });

  it('exports READY_STATE', async () => {
    const { READY_STATE } = await import('./health.runtime');
    expect(READY_STATE.ready).toBe(false);
  });
});
