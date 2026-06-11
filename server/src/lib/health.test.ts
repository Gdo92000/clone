import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockDb } = vi.hoisted(() => ({
  mockDb: {
    execute: vi.fn(),
  },
}));

vi.mock('../db', () => ({ db: mockDb }));

import { checkHealth } from './health';

beforeEach(() => {
  vi.clearAllMocks();
});

describe('checkHealth', () => {
  it('returns ok when db responds', async () => {
    mockDb.execute.mockResolvedValue([{ '?column?': 1 }]);
    const result = await checkHealth();
    expect(result.status).toBe('ok');
    expect(result.database).toBe('ok');
  });

  it('returns degraded when db fails', async () => {
    mockDb.execute.mockRejectedValue(new Error('connection refused'));
    const result = await checkHealth();
    expect(result.status).toBe('degraded');
    expect(result.database).toBe('down');
  });

  it('includes uptime', async () => {
    mockDb.execute.mockResolvedValue([{ '?column?': 1 }]);
    const result = await checkHealth();
    expect(typeof result.uptime).toBe('number');
    expect(result.uptime).toBeGreaterThanOrEqual(0);
  });

  it('includes timestamp', async () => {
    mockDb.execute.mockResolvedValue([{ '?column?': 1 }]);
    const result = await checkHealth();
    expect(typeof result.timestamp).toBe('string');
    expect(new Date(result.timestamp).getTime()).not.toBeNaN();
  });
});
