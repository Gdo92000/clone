import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AppError } from '../errors';

beforeEach(() => {
  vi.useRealTimers();
});

describe('isTransientError', () => {
  it('returns true for 5xx AppError', async () => {
    const { isTransientError } = await import('./index');
    expect(isTransientError(new AppError(503, 'Service Unavailable'))).toBe(true);
  });

  it('returns false for 4xx AppError', async () => {
    const { isTransientError } = await import('./index');
    expect(isTransientError(new AppError(400, 'Bad Request'))).toBe(false);
  });

  it('returns true for PG transient codes', async () => {
    const { isTransientError } = await import('./index');
    const err = new Error('deadlock') as Error & { code: string };
    err.code = '40P01';
    expect(isTransientError(err)).toBe(true);
  });

  it('returns true for network transient codes', async () => {
    const { isTransientError } = await import('./index');
    const err = new Error('connection reset') as Error & { code: string };
    err.code = 'ECONNRESET';
    expect(isTransientError(err)).toBe(true);
  });

  it('returns true for timeout messages', async () => {
    const { isTransientError } = await import('./index');
    expect(isTransientError(new Error('connection timeout'))).toBe(true);
  });

  it('returns false for generic errors', async () => {
    const { isTransientError } = await import('./index');
    expect(isTransientError(new Error('not found'))).toBe(false);
  });

  it('returns false for non-error values', async () => {
    const { isTransientError } = await import('./index');
    expect(isTransientError(null)).toBe(false);
    expect(isTransientError('string')).toBe(false);
  });
});

describe('delay', () => {
  it('resolves after given ms', async () => {
    vi.useFakeTimers();
    const { delay } = await import('./index');
    const p = delay(50);
    vi.advanceTimersByTime(50);
    await expect(p).resolves.toBeUndefined();
    vi.useRealTimers();
  });

  it('resolves immediately for ms <= 0', async () => {
    const { delay } = await import('./index');
    await expect(delay(0)).resolves.toBeUndefined();
    await expect(delay(-1)).resolves.toBeUndefined();
  });
});

describe('retry', () => {
  it('returns result on first success', async () => {
    const { retry } = await import('./index');
    const fn = vi.fn().mockResolvedValue('ok');
    await expect(retry(fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('throws on non-transient error without retry', async () => {
    const { retry } = await import('./index');
    const fn = vi.fn().mockRejectedValue(new Error('not found'));
    await expect(retry(fn)).rejects.toThrow('not found');
    expect(fn).toHaveBeenCalledTimes(1);
  });
});

describe('CircuitBreaker', () => {
  it('starts CLOSED', async () => {
    const { CircuitBreaker, CircuitBreakerState } = await import('./index');
    const cb = new CircuitBreaker();
    expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
  });

  it('opens after threshold failures', async () => {
    const { CircuitBreaker, CircuitBreakerState } = await import('./index');
    const cb = new CircuitBreaker({ failureThreshold: 2 });
    const fn = vi.fn().mockRejectedValue(new Error('fail'));
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    expect(cb.getState()).toBe(CircuitBreakerState.CLOSED);
    await expect(cb.execute(fn)).rejects.toThrow('fail');
    expect(cb.getState()).toBe(CircuitBreakerState.OPEN);
  });

  it('rejects with error when OPEN', async () => {
    const { CircuitBreaker, CircuitBreakerState } = await import('./index');
    const cb = new CircuitBreaker({ failureThreshold: 1 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    expect(cb.getState()).toBe(CircuitBreakerState.OPEN);
  });

  it('transitions to HALF_OPEN after resetMs', async () => {
    vi.useFakeTimers();
    const { CircuitBreaker, CircuitBreakerState } = await import('./index');
    const cb = new CircuitBreaker({ failureThreshold: 1, resetMs: 100 });
    await expect(cb.execute(() => Promise.reject(new Error('fail')))).rejects.toThrow('fail');
    vi.advanceTimersByTime(100);
    expect(cb.getState()).toBe(CircuitBreakerState.HALF_OPEN);
    vi.useRealTimers();
  });
});

describe('runSaga', () => {
  it('returns last result on success', async () => {
    const { runSaga } = await import('./index');
    const result = await runSaga([
      { name: 'step1', execute: () => Promise.resolve('result1') },
      { name: 'step2', execute: () => Promise.resolve('result2') },
    ]);
    expect(result.ok).toBe(true);
  });
});
