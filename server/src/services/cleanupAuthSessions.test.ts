import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = vi.hoisted(() => ({
  delete: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
}));

vi.mock('../db', () => ({ db: mockDb }));
vi.mock('../lib/logger', () => ({ logger: { error: vi.fn() } }));

describe('cleanupAuthSessions', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('deletes expired and revoked sessions', async () => {
    const { cleanupAuthSessions } = await import('./cleanupAuthSessions');
    await cleanupAuthSessions();
    expect(mockDb.delete).toHaveBeenCalled();
  });

  it('startSessionCleanup calls cleanup and sets interval', async () => {
    vi.useFakeTimers();
    const { startSessionCleanup } = await import('./cleanupAuthSessions');
    startSessionCleanup(1000);
    expect(mockDb.delete).toHaveBeenCalled();
    vi.advanceTimersByTime(1000);
    expect(mockDb.delete).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
