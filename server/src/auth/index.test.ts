import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('auth/index', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    delete process.env.AUTH_PROVIDER;
  });

  it('returns local provider by default', { timeout: 10_000 }, async () => {
    delete process.env.AUTH_PROVIDER;
    const { getAuthProvider } = await import('./index');
    const provider = getAuthProvider();
    expect(provider.name).toBe('local');
  });

  it('returns local provider when AUTH_PROVIDER=local', { timeout: 10_000 }, async () => {
    process.env.AUTH_PROVIDER = 'local';
    const { getAuthProvider } = await import('./index');
    const provider = getAuthProvider();
    expect(provider.name).toBe('local');
  });

  it('exports localAuthProvider', { timeout: 10_000 }, async () => {
    const { localAuthProvider } = await import('./index');
    expect(localAuthProvider.name).toBe('local');
  });

  it('exports types (type-only check)', { timeout: 10_000 }, async () => {
    const auth = await import('./index');
    expect(typeof auth.getAuthProvider).toBe('function');
    expect(typeof auth.localAuthProvider).toBe('object');
  });
});