import { logger } from './logger';

type CircuitState = 'CLOSED' | 'OPEN' | 'HALF_OPEN';

interface CircuitBreakerOptions {
  failureThreshold: number;
  successThreshold: number;
  timeoutMs: number;
  name: string;
}

interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number;
  nextAttemptTime: number;
}

const breakers = new Map<string, CircuitBreakerState>();

const defaultOptions: CircuitBreakerOptions = {
  failureThreshold: 5,
  successThreshold: 2,
  timeoutMs: 30_000,
  name: 'unnamed',
};

export function getCircuitState(name: string): CircuitState {
  return breakers.get(name)?.state ?? 'CLOSED';
}

export function getCircuitStates(): Record<string, CircuitState> {
  const states: Record<string, CircuitState> = {};
  for (const [name, state] of breakers) {
    states[name] = state.state;
  }
  return states;
}

export async function circuitBreakerCall<T>(
  fn: () => Promise<T>,
  userOptions?: Partial<CircuitBreakerOptions>,
): Promise<T> {
  const opts = { ...defaultOptions, ...userOptions };
  const now = Date.now();
  let state = breakers.get(opts.name);

  if (!state) {
    state = { state: 'CLOSED', failures: 0, successes: 0, lastFailureTime: 0, nextAttemptTime: 0 };
    breakers.set(opts.name, state);
  }

  if (state.state === 'OPEN') {
    if (now < state.nextAttemptTime) {
      throw new CircuitBreakerOpenError(opts.name, state.nextAttemptTime - now);
    }
    state.state = 'HALF_OPEN';
    state.successes = 0;
    logger.warn(`Circuit breaker "${opts.name}" → HALF_OPEN — probing`);
  }

  try {
    const result = await fn();
    if (state.state === 'HALF_OPEN') {
      state.successes++;
      if (state.successes >= opts.successThreshold) {
        state.state = 'CLOSED';
        state.failures = 0;
        state.successes = 0;
        logger.info(`Circuit breaker "${opts.name}" → CLOSED — recovered`);
      }
    } else {
      state.successes = 0;
    }
    state.lastFailureTime = 0;
    return result;
  } catch (err) {
    state.failures++;
    state.lastFailureTime = now;
    state.successes = 0;
    if (state.failures >= opts.failureThreshold) {
      state.state = 'OPEN';
      state.nextAttemptTime = now + opts.timeoutMs;
      logger.warn(`Circuit breaker "${opts.name}" → OPEN — failing fast for ${opts.timeoutMs}ms`);
    }
    throw err;
  }
}

export function resetCircuit(name: string): void {
  breakers.delete(name);
}

export function resetAllCircuits(): void {
  breakers.clear();
}

export class CircuitBreakerOpenError extends Error {
  retryAfterMs: number;
  constructor(name: string, retryAfterMs: number) {
    super(`Circuit breaker "${name}" is OPEN. Retry after ${retryAfterMs}ms`);
    this.name = 'CircuitBreakerOpenError';
    this.retryAfterMs = retryAfterMs;
  }
}
