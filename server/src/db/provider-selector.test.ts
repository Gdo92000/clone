import { describe, it, expect, beforeEach } from 'vitest';

describe('provider-selector', () => {
  beforeEach(async () => {
    const mod = await import('./provider-selector');
    mod.setProvider('memory', {
      hasTelemetry: false, hasReplay: true, hasChaos: true,
      hasOfflinePersistence: true, hasSnapshot: true,
    });
  });

  it('getProvider returns set provider', async () => {
    const { getProvider } = await import('./provider-selector');
    expect(getProvider()).toBe('memory');
  });

  it('getCapabilities returns capabilities', async () => {
    const { getCapabilities } = await import('./provider-selector');
    const caps = getCapabilities();
    expect(caps.hasReplay).toBe(true);
  });

  it('setProvider updates globalThis', async () => {
    const { setProvider, getCapabilities } = await import('./provider-selector');
    setProvider('postgres', {
      hasTelemetry: true, hasReplay: false, hasChaos: false,
      hasOfflinePersistence: false, hasSnapshot: false,
    });
    const caps = getCapabilities();
    expect(caps.hasTelemetry).toBe(true);
  });
});
