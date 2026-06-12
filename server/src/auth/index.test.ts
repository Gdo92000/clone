import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getAuthProvider, localAuthProvider } from './index';

describe('auth/index', () => {
  beforeEach(() => {
    delete process.env.AUTH_PROVIDER;
  });

  afterEach(() => {
    delete process.env.AUTH_PROVIDER;
  });

  it('returns local provider by default', () => {
    delete process.env.AUTH_PROVIDER;
    const provider = getAuthProvider();
    expect(provider.name).toBe('local');
  });

  it('returns local provider when AUTH_PROVIDER=local', () => {
    process.env.AUTH_PROVIDER = 'local';
    const provider = getAuthProvider();
    expect(provider.name).toBe('local');
  });

  it('exports localAuthProvider', () => {
    expect(localAuthProvider.name).toBe('local');
  });

  it('exports types (type-only check)', () => {
    expect(typeof getAuthProvider).toBe('function');
    expect(typeof localAuthProvider).toBe('object');
  });
});