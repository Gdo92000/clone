import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../db/provider', () => ({
  resolveDbProvider: vi.fn(() => 'memory' as const),
  CAPABILITIES: { memory: { hasReplay: false, hasChaos: false, hasTelemetry: false, hasOfflinePersistence: false, hasSnapshot: false } },
}));

vi.mock('../db/provider-selector', () => ({
  setProvider: vi.fn(),
  getProvider: vi.fn(() => { throw new Error('Not initialized'); }),
  getCapabilities: vi.fn(() => { throw new Error('Not initialized'); }),
}));

vi.mock('../db/registry-memory', () => ({
  clearAllMemoryStores: vi.fn(),
  resetMemoryStore: vi.fn(),
}));

vi.mock('../replay/recorder', () => ({
  startReplayRecorder: vi.fn(),
  stopReplayRecorder: vi.fn(),
}));

vi.mock('../telemetry/router', () => ({
  startTelemetry: vi.fn(),
  shutdownTelemetry: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../db', () => ({
  createDatabase: vi.fn(() => ({ registry: {}, provider: 'memory' })),
}));

describe('environmentRuntime', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (globalThis as Record<string, unknown>)['__flux_registry__'];
    delete (globalThis as Record<string, unknown>)['__flux_capabilities__'];
  });

  it('isMemoryMode returns false when not initialized', async () => {
    const { isMemoryMode } = await import('./environmentRuntime');
    expect(isMemoryMode()).toBe(false);
  });

  it('shutdownRuntime cleans up globals', async () => {
    const { shutdownRuntime } = await import('./environmentRuntime');
    await shutdownRuntime();
    expect((globalThis as Record<string, unknown>)['__flux_registry__']).toBeUndefined();
  });
});
