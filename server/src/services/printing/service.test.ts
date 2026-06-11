import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = vi.hoisted(() => ({
  insert: vi.fn(() => ({ values: vi.fn().mockResolvedValue(undefined) })),
  select: vi.fn(() => ({
    from: vi.fn(() => ({
      where: vi.fn(() => ({
        limit: vi.fn().mockResolvedValue([]),
      })),
    })),
  })),
  update: vi.fn(() => ({
    set: vi.fn(() => ({ where: vi.fn().mockResolvedValue(undefined) })),
  })),
}));

vi.mock('../../db', () => ({ db: mockDb }));
vi.mock('../../lib/logger', () => ({ logger: { info: vi.fn(), error: vi.fn() } }));
vi.mock('../../db/schema', () => ({ printJobs: {}, printerConfigs: {} }));

describe('PrintingService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('enqueuePrintJob inserts job and returns id', async () => {
    const { PrintingService } = await import('./service');
    const jobId = await PrintingService.enqueuePrintJob('branch-1', 'order-1', 'print-data');
    expect(mockDb.insert).toHaveBeenCalled();
    expect(jobId).toBeDefined();
    expect(typeof jobId).toBe('string');
  });
});
