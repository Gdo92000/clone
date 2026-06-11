import { describe, it, expect, beforeEach } from 'vitest';

describe('registry-memory', () => {
  beforeEach(async () => {
    const { clearAllMemoryStores } = await import('./registry-memory');
    clearAllMemoryStores();
  });

  it('createMemoryRegistry returns registry with repos', async () => {
    const { createMemoryRegistry } = await import('./registry-memory');
    const reg = createMemoryRegistry({
      hasTelemetry: false, hasReplay: true, hasChaos: true,
      hasOfflinePersistence: true, hasSnapshot: true,
    });
    expect(reg.provider).toBe('memory');
    expect(reg.repos.restaurants).toBeDefined();
    expect(reg.repos.branches).toBeDefined();
    expect(typeof reg.health.check).toBe('function');
  });

  it('clearAllMemoryStores resets store cache', async () => {
    const { createMemoryRegistry, clearAllMemoryStores, resetMemoryStore } = await import('./registry-memory');
    createMemoryRegistry({
      hasTelemetry: false, hasReplay: true, hasChaos: true,
      hasOfflinePersistence: true, hasSnapshot: true,
    });
    resetMemoryStore('restaurants');
    clearAllMemoryStores();
  });
});
