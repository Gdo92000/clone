import type { Context } from 'hono';
import { describe, it, expect } from 'vitest';
import { getTenantId, validateTenantAccess } from './tenant';

interface FakeJwtPayload {
  company_id?: string;
  role?: string;
  [key: string]: unknown;
}

interface FakeEnv {
  Variables: { jwtPayload: FakeJwtPayload };
}

function createFakeContext(payload: FakeJwtPayload): Context<FakeEnv> {
  return {
    get: (key: string) => key === 'jwtPayload' ? payload : undefined,
  } as unknown as Context<FakeEnv>;
}

describe('getTenantId', () => {
  it('returns company_id from jwtPayload', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'merchant' });
    expect(getTenantId(ctx)).toBe('company-1');
  });

  it('returns null when no jwtPayload', () => {
    const ctx = createFakeContext({});
    expect(getTenantId(ctx)).toBe(null);
  });

  it('returns null when company_id is empty', () => {
    const ctx = createFakeContext({ company_id: '' });
    expect(getTenantId(ctx)).toBe(null);
  });
});

describe('validateTenantAccess', () => {
  it('returns true for superadmin', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'superadmin' });
    expect(validateTenantAccess(ctx, 'other-company')).toBe(true);
  });

  it('returns true for admin', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'admin' });
    expect(validateTenantAccess(ctx, 'company-1')).toBe(true);
  });

  it('returns false when no tenant context', () => {
    const ctx = createFakeContext({ role: 'merchant' });
    expect(validateTenantAccess(ctx, 'company-1')).toBe(false);
  });

  it('returns true when resource has no company', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'merchant' });
    expect(validateTenantAccess(ctx, null)).toBe(true);
  });

  it('returns true when tenant matches resource company', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'merchant' });
    expect(validateTenantAccess(ctx, 'company-1')).toBe(true);
  });

  it('returns false when tenant does not match', () => {
    const ctx = createFakeContext({ company_id: 'company-1', role: 'merchant' });
    expect(validateTenantAccess(ctx, 'company-2')).toBe(false);
  });
});
