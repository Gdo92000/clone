/**
 * resilience.ts — retry, saga e delay para falhas transitórias.
 *
 * Retry com back-off exponencial para erros transitórios de rede/DB.
 * Saga para orquestrar passos atômicos com invertedores de rollback.
 * Delay provider para atrasos determinísticos em modo memory/test.
 */

import type { AppError } from '../errors';

// ─── delay ──────────────────────────────────────────────────────────────────────

/**
 * delay — aguarda `ms` milissegundos.
 * Usado em retry back-off ou para simular latência controlada.
 *
 * @param ms Milissegundos a aguardar. ≤ 0 retorna Promise.resolve().
 * @returns Promise que resolve após o tempo especificado.
 */
export function delay(ms: number): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

// ─── tipos de erro transitório ──────────────────────────────────────────────────

/** Códigos PostgreSQL transitórios. */
const TRANSIENT_PG_CODES = new Set([
  '57P01', // admin shutdown
  '57P02', // crash shutdown
  '57P03', // cannot connect now
  '40001', // serialization failure
  '40P01', // deadlock detected
]);

/** Códigos de erro de rede transitórios. */
const TRANSIENT_NET_CODES = new Set([
  'ECONNRESET',
  'ECONNREFUSED',
  'ETIMEDOUT',
  'EPIPE',
  'EHOSTUNREACH',
  'ENETUNREACH',
  'ESOCKETTIMEDOUT',
]);

/**
 * isTransientError — decide se um erro é transitório e vale a pena tentar de novo.
 *
 * Considera transitórios:
 *  - Erros `AppError` com status 5xx
 *  - Erros com `.code` em `TRANSIENT_PG_CODES` ou `TRANSIENT_NET_CODES`
 *  - `Error` com mensagem contendo 'timeout', 'ECONNR', 'ENET'
 */
export function isTransientError(err: unknown): boolean {
  if (err instanceof AppError) {
    return err.statusCode >= 500;
  }
  if (typeof err === 'object' && err !== null && 'code' in (err as Record<string, unknown>)) {
    const code = (err as Record<string, string>).code;
    return TRANSIENT_PG_CODES.has(code) || TRANSIENT_NET_CODES.has(code);
  }
  if (err instanceof Error) {
    const msg = err.message.toLowerCase();
    return (
      msg.includes('timeout') ||
      msg.includes('econnr') ||
      msg.includes('enetunreach') ||
      msg.includes('esocket')
    );
  }
  return false;
}

// ─── retry options ──────────────────────────────────────────────────────────────

export interface RetryOptions {
  /** Número máximo de tentativas (inclui a chamada inicial). Padrão: 3. */
  maxAttempts?: number;
  /** Atraso base em ms. Padrão: 100. */
  baseDelayMs?: number;
  /** Back-off exponencial com jitter: `baseDelay * 2^(n-1) + Math.random()*baseDelay`. */
  exponentialBackoff?: boolean;
  /** Função de log para tentativas. Se não passado, não loga. */
  onRetry?: (attempt: number, error: unknown) => void;
}

// ─── retry ──────────────────────────────────────────────────────────────────────

/**
 * retry — executa `fn` até `maxAttempts` vezes enquanto o erro for transitório.
 *
 * Para imediatamente (sem nova tentativa) se:
 *  - `fn` retornar sucesso
 *  - erro não for transitório após `maxAttempts` tentativas
 *  - `maxAttempts === 1`
 *
 * @param fn Função assíncrona a executar.
 * @param opts Opções de retry.
 * @returns Resultado de `fn` na tentativa bem-sucedida.
 * @throws Último erro encontrado se todas as tentativas falharem.
 */
export async function retry<T>(fn: () => Promise<T>, opts: RetryOptions = {}): Promise<T> {
  const maxAttempts = opts.maxAttempts ?? 3;
  const baseDelay = opts.baseDelayMs ?? 100;
  const useExponential = opts.exponentialBackoff ?? true;

  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      // Não é transitório: falha imediatamente
      if (!isTransientError(err)) {
        throw err;
      }
      // Última tentativa: propaga o erro
      if (attempt >= maxAttempts) {
        throw err;
      }
      opts.onRetry?.(attempt, err);
      const nextDelay = useExponential
        ? baseDelay * Math.pow(2, attempt - 1) + Math.random() * baseDelay
        : baseDelay;
      await delay(nextDelay);
    }
  }

  throw lastError;
}

// ─── circuit breaker ────────────────────────────────────────────────────────────

export enum CircuitBreakerState {
  CLOSED = 'CLOSED',
  OPEN = 'OPEN',
  HALF_OPEN = 'HALF_OPEN',
}

export interface CircuitBreakerOptions {
  /** Número de falhas antes de abrir o circuito. Padrão: 5. */
  failureThreshold?: number;
  /** Tempo em ms antes de tentar HALF_OPEN. Padrão: 30_000 (30 s). */
  resetMs?: number;
}

/**
 * CircuitBreaker — monitora falhas consecutivas e bloqueia novas chamadas
 * quando o limite é ultrapassado (estado OPEN). Reseta para CLOSED após `resetMs`.
 *
 * Thread-safe via fechamento (closures) — não mantém estado global.
 *
 * @example
 * ```ts
 * const breaker = new CircuitBreaker();
 * try {
 *   const result = await breaker.execute(() => fetchSomething());
 * } catch (err) {
 *   if (breaker.getState() === CircuitBreakerState.OPEN) { ... }
 * }
 * ```
 */
export class CircuitBreaker {
  private state: CircuitBreakerState = CircuitBreakerState.CLOSED;
  private failureCount = 0;
  private lastFailureTime = 0;
  private readonly threshold: number;
  private readonly resetMs: number;

  constructor(opts: CircuitBreakerOptions = {}) {
    this.threshold = opts.failureThreshold ?? 5;
    this.resetMs = opts.resetMs ?? 30_000;
  }

  /** Estado atual do circuito. */
  getState(): CircuitBreakerState {
    if (this.state === CircuitBreakerState.OPEN) {
      if (Date.now() - this.lastFailureTime >= this.resetMs) {
        this.state = CircuitBreakerState.HALF_OPEN;
      }
    }
    return this.state;
  }

  /**
   * execute — executa `fn` se o circuito permitir.
   * Se o circuito estiver OPEN lança Error imediatamente.
   * Se HALF_OPEN e `fn` falhar, volta para OPEN.
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    const current = this.getState();

    if (current === CircuitBreakerState.OPEN) {
      throw new Error(`Circuit breaker aberto desde ${new Date(this.lastFailureTime).toISOString()}`);
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (err) {
      this.onFailure();
      throw err;
    }
  }

  /** Reseta o circuito para CLOSED e limpa contador. */
  reset(): void {
    this.state = CircuitBreakerState.CLOSED;
    this.failureCount = 0;
    this.lastFailureTime = 0;
  }

  private onSuccess(): void {
    if (this.state === CircuitBreakerState.HALF_OPEN) {
      this.state = CircuitBreakerState.CLOSED;
    }
    this.failureCount = 0;
  }

  private onFailure(): void {
    this.failureCount += 1;
    this.lastFailureTime = Date.now();
    if (this.failureCount >= this.threshold) {
      this.state = CircuitBreakerState.OPEN;
    }
  }
}

// ─── saga ────────────────────────────────────────────────────────────────────────

/**
 * SagaStep — definição de um passo na saga.
 *
 * @template T  Tipo do valor de entrada do passo.
 * @template R  Tipo do valor retornado pelo passo.
 */
export interface SagaStep<T, R> {
  /** Nome do passo para logging/depuração. */
  name: string;
  /**
   * execute — executa o passo principal.
   * Se lançar, os compensadores (rollback) dos passos anteriores são chamados.
   */
  execute: (input: T) => Promise<R>;
  /**
   * compensate — desfaz o efeito do passo se um passo posterior falhar.
   * Opcional — se não fornecido o passo "não tem volta".
   */
  compensate?: (result: R) => Promise<void>;
}

/**
 * SagaResult — resultado do execution da saga.
 */
export type SagaResult<R> =
  | { ok: true; value: R }
  | { ok: false; error: Error };

/**
 * runSaga — executa uma sequência de passos de saga.
 *
 * Comportamento:
 *  - Executa cada passo em ordem.
 *  - Se um passo falhar, executa os compensadores em ordem reversa até o passo que falhou.
 *  - Se um compensador falhar, o erro é coletado e propagado junto ao original.
 *
 * @param steps Lista de passos.
 * @returns SagaResult.ok ou SagaResult.error.
 */
export async function runSaga<T>(steps: SagaStep<T, unknown>[]): Promise<SagaResult<unknown>> {
  const results: unknown[] = [];
  const executedSteps: SagaStep<T, unknown>[] = [];

  for (const step of steps) {
    try {
      const value = await step.execute({} as T);
      results.push(value);
      executedSteps.push(step);
    } catch (err) {
      const rollbackErrors: Error[] = [];
      // Executa compensadores em ordem reversa
      for (let i = executedSteps.length - 1; i >= 0; i--) {
        const prevStep = executedSteps[i];
        if (prevStep.compensate) {
          try {
            await prevStep.compensate(results[i]);
          } catch (rbErr) {
            rollbackErrors.push(
              rbErr instanceof Error ? rbErr : new Error(String(rbErr)),
            );
          }
        }
      }
      const mainErr = err instanceof Error ? err : new Error(String(err));
      if (rollbackErrors.length > 0) {
        mainErr.message += `\nRollback errors: ${rollbackErrors.map((e) => e.message).join('; ')}`;
      }
      return { ok: false, error: mainErr };
    }
  }

  return { ok: true, value: results[results.length - 1] ?? null };
}

/**
 * runStep — helper para executar um único passo de saga com retry + circuit breaker.
 *
 * @param name Nome do passo.
 * @param fn Função principal do passo.
 * @param opts Opções de retry (aplica ao passo).
 * @returns Resultado do passo.
 */
export async function runStep<T>(name: string, fn: () => Promise<T>, opts?: RetryOptions & { circuitBreaker?: CircuitBreaker }): Promise<T> {
  const { circuitBreaker, ...retryOpts } = opts ?? {};
  if (circuitBreaker) {
    return circuitBreaker.execute(() => retry(fn, retryOpts));
  }
  return retry(fn, retryOpts);
}
