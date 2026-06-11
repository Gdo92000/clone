import { describe, it, expect, beforeEach } from 'vitest';
import { circuitBreakerCall, getCircuitState, getCircuitStates, resetCircuit, resetAllCircuits, CircuitBreakerOpenError } from './circuitBreaker';

beforeEach(() => {
  resetAllCircuits();
});

describe('circuitBreakerCall', () => {
  it('calls the function and returns its result when CLOSED', async () => {
    const result = await circuitBreakerCall(() => Promise.resolve('ok'), { name: 'test' });
    expect(result).toBe('ok');
    expect(getCircuitState('test')).toBe('CLOSED');
  });

  it('opens after repeated failures', async () => {
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'fail-test', failureThreshold: 5 })).rejects.toThrow('fail');
    }
    expect(getCircuitState('fail-test')).toBe('OPEN');
  });

  it('throws CircuitBreakerOpenError when OPEN', async () => {
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'open-test', failureThreshold: 5, timeoutMs: 30000 })).rejects.toThrow();
    }
    await expect(circuitBreakerCall(() => Promise.resolve('ok'), { name: 'open-test', failureThreshold: 5, timeoutMs: 30000 }))
      .rejects.toThrow(CircuitBreakerOpenError);
    expect(getCircuitState('open-test')).toBe('OPEN');
  });

  it('transitions to HALF_OPEN after timeout and succeeds on probe', { timeout: 5000 }, async () => {
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'half-test', failureThreshold: 5, timeoutMs: 100 })).rejects.toThrow();
    }
    expect(getCircuitState('half-test')).toBe('OPEN');
    await new Promise(r => setTimeout(r, 150));
    const result = await circuitBreakerCall(() => Promise.resolve('probe-ok'), { name: 'half-test', failureThreshold: 5, timeoutMs: 100 });
    expect(result).toBe('probe-ok');
    expect(getCircuitState('half-test')).toBe('HALF_OPEN');
  });

  it('closes after successThreshold successes in HALF_OPEN', { timeout: 5000 }, async () => {
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'close-test', failureThreshold: 5, successThreshold: 3, timeoutMs: 50 })).rejects.toThrow();
    }
    expect(getCircuitState('close-test')).toBe('OPEN');
    await new Promise(r => setTimeout(r, 60));
    await circuitBreakerCall(() => Promise.resolve('probe'), { name: 'close-test', failureThreshold: 5, successThreshold: 3, timeoutMs: 50 });
    expect(getCircuitState('close-test')).toBe('HALF_OPEN');
    const r1 = await circuitBreakerCall(() => Promise.resolve('ok1'), { name: 'close-test', failureThreshold: 5, successThreshold: 3, timeoutMs: 50 });
    expect(r1).toBe('ok1');
    expect(getCircuitState('close-test')).toBe('HALF_OPEN');
    const r2 = await circuitBreakerCall(() => Promise.resolve('ok2'), { name: 'close-test', failureThreshold: 5, successThreshold: 3, timeoutMs: 50 });
    expect(r2).toBe('ok2');
    expect(getCircuitState('close-test')).toBe('CLOSED');
  });
});

describe('getCircuitState', () => {
  it('returns CLOSED for unknown circuits', () => {
    expect(getCircuitState('unknown')).toBe('CLOSED');
  });
});

describe('getCircuitStates', () => {
  it('returns all circuit states', async () => {
    await circuitBreakerCall(() => Promise.resolve('a'), { name: 'alpha' });
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'beta', failureThreshold: 5, timeoutMs: 99999 })).rejects.toThrow();
    }
    const states = getCircuitStates();
    expect(states.alpha).toBe('CLOSED');
    expect(states.beta).toBe('OPEN');
  });
});

describe('resetCircuit', () => {
  it('resets a single circuit', async () => {
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'reset-me', failureThreshold: 5 })).rejects.toThrow();
    }
    expect(getCircuitState('reset-me')).toBe('OPEN');
    resetCircuit('reset-me');
    expect(getCircuitState('reset-me')).toBe('CLOSED');
  });
});

describe('resetAllCircuits', () => {
  it('resets all circuits', async () => {
    await circuitBreakerCall(() => Promise.resolve('ok'), { name: 'a' });
    const fn = () => Promise.reject(new Error('fail'));
    for (let i = 0; i < 5; i++) {
      await expect(circuitBreakerCall(fn, { name: 'b', failureThreshold: 5 })).rejects.toThrow();
    }
    resetAllCircuits();
    expect(getCircuitStates()).toEqual({});
  });
});

describe('CircuitBreakerOpenError', () => {
  it('has name and retryAfterMs', () => {
    const err = new CircuitBreakerOpenError('my-circuit', 5000);
    expect(err.name).toBe('CircuitBreakerOpenError');
    expect(err.retryAfterMs).toBe(5000);
    expect(err.message).toContain('my-circuit');
    expect(err.message).toContain('5000');
  });
});
