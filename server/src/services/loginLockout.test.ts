import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.hoisted(() => {
  process.env.JWT_SECRET = 'test';
  process.env.CORS_ORIGINS = 'localhost';
  process.env.LOGIN_MAX_ATTEMPTS = '5';
  process.env.LOGIN_LOCKOUT_MINUTES = '15';
});

import { recordFailedAttempt, isLockedOut, getRemainingLockoutSeconds, clearAttempts } from './loginLockout';

beforeEach(() => {
  clearAttempts('test@e.com');
  clearAttempts('test@e.com', '192.168.1.1');
  clearAttempts('test@e.com', '10.0.0.1');
  clearAttempts('user-a@e.com');
  clearAttempts('user-b@e.com');
  clearAttempts('other@e.com');
  clearAttempts('unknown@e.com');
});

describe('recordFailedAttempt', () => {
  it('increments count on successive failures', () => {
    for (let i = 0; i < 4; i++) recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(false);
    recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
  });

  it('uses different keys for different emails', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt('user-a@e.com');
    expect(isLockedOut('user-a@e.com')).toBe(true);
    expect(isLockedOut('user-b@e.com')).toBe(false);
  });

  it('differentiates by ip when provided', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com', '192.168.1.1');
    expect(isLockedOut('test@e.com', '192.168.1.1')).toBe(true);
    expect(isLockedOut('test@e.com', '10.0.0.1')).toBe(false);
  });

  it('does not increment count while locked out', () => {
    for (let i = 0; i < 10; i++) recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
  });

  it('resets count after lockout expires', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(isLockedOut('test@e.com')).toBe(false);
    vi.useRealTimers();
  });
});

describe('isLockedOut', () => {
  it('returns false when no attempts recorded', () => {
    expect(isLockedOut('unknown@e.com')).toBe(false);
  });

  it('returns false after clearAttempts', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
    clearAttempts('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(false);
  });
});

describe('getRemainingLockoutSeconds', () => {
  it('returns 0 when not locked out', () => {
    expect(getRemainingLockoutSeconds('test@e.com')).toBe(0);
  });

  it('returns positive seconds when locked out', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    const remaining = getRemainingLockoutSeconds('test@e.com');
    expect(remaining).toBeGreaterThan(0);
    expect(remaining).toBeLessThanOrEqual(15 * 60);
    vi.useRealTimers();
  });

  it('returns 0 after lockout expires', () => {
    vi.useFakeTimers();
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    vi.advanceTimersByTime(15 * 60 * 1000 + 1);
    expect(getRemainingLockoutSeconds('test@e.com')).toBe(0);
    vi.useRealTimers();
  });
});

describe('clearAttempts', () => {
  it('removes lockout state for exact key', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
    clearAttempts('test@e.com');
    expect(isLockedOut('test@e.com')).toBe(false);
  });

  it('does not affect other keys', () => {
    for (let i = 0; i < 5; i++) recordFailedAttempt('test@e.com');
    clearAttempts('other@e.com');
    expect(isLockedOut('test@e.com')).toBe(true);
  });
});
