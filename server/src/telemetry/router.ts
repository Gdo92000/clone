/**
 * Telemetry — rastreamento de requisições e spans.
 *
 * Funciona em modo postgres (hasTelemetry=true).
 * Em modo memory é um no-op (só logs estruturados).
 *
 * Construído sobre:
 *  - `RequestStore` (AsyncLocalStorage) — requestId / userId / tenantId
 *  - `prom-client` — métricas HTTP de `metrics.ts`
 *  - `pino` — logs estruturados via `logger.ts`
 *
 * Uso:
 * ```ts
 * import { withSpan, recordSpanMetric } from '../lib/telemetry';
 *
 * const result = await withSpan('coverage.find', async (span) => {
 *   const cities = await registry.repos.coverageCities.findMany();
 *   span.addTag('count', String(cities.length));
 *   return cities;
 * });
 * ```
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import { getRequestStore } from '../lib/requestContext';
import { logger } from '../lib/logger';

// ─── tipos ──────────────────────────────────────────────────────────────────────

/** Tag chave → valor string associada a um span. */
export type SpanTag = Record<string, string>;

/**
 * Span — representa uma operação rastreada dentro de uma requisição.
 *
 * Criado via `openSpan()`.  Fechado com `.close()` ou `withSpan()`.
 */
export interface ISpan {
  readonly name: string;
  readonly requestId: string;
  readonly startedAt: number;
  /** Retorna true se o span já foi fechado. */
  isClosed(): boolean;
  addTag(key: string, value: string): void;
  recordError(error: Error): void;
  close(): void;
}

// ─── SpanStore ──────────────────────────────────────────────────────────────────

/**
 * SpanStore — armazena spans ativos por contexto de execução.
 *
 * Usa AsyncLocalStorage quando disponível (dentro de handlers de request),
 * caindo para um Map singleton nos demais casos.
 */
class SpanStore {
  private als = new AsyncLocalStorage<Map<string, ISpan>>();
  /** Fallback quando não há store ALS — compartilhado entre contextos sem ALS. */
  private fallback = new Map<string, ISpan>();
  private isFallbackSet = false;

  /** Inicializa o fallback — chamado por initTelemetry(). */
  initFallback(): void {
    if (!this.isFallbackSet) {
      this.als.enterWith(this.fallback);
      this.isFallbackSet = true;
    }
  }

  getStore(): Map<string, ISpan> | undefined {
    return this.als.getStore();
  }

  runWithStore<T>(store: Map<string, ISpan>, fn: () => T): T {
    return this.als.run(store, fn);
  }

  /** Retorna a store ativa, ou o fallback singleton. */
  getActiveStore(): Map<string, ISpan> {
    return this.als.getStore() ?? this.fallback;
  }
}

// ─── SpanImpl ──────────────────────────────────────────────────────────────────

class SpanImpl implements ISpan {
  readonly name: string;
  readonly requestId: string;
  readonly startedAt: number;
  private tags: SpanTag = {};
  private _error: Error | null = null;
  private _closed = false;

  constructor(name: string, requestId: string) {
    this.name = name;
    this.requestId = requestId;
    this.startedAt = Date.now();
  }

  isClosed(): boolean {
    return this._closed;
  }

  addTag(key: string, value: string): void {
    if (!this._closed) this.tags[key] = value;
  }

  recordError(error: Error): void {
    if (!this._closed) this._error = error;
  }

  close(): void {
    if (this._closed) return;
    // ... (resto igual)
    this._closed = true;

    const durationMs = Date.now() - this.startedAt;
    const level = this._error ? 'error' : 'info';

    logger[level](
      `span:${this.name}`,
      {
        span: this.name,
        durationMs,
        ...this.tags,
        ...(this._error ? { errorMessage: this._error.message } : {}),
        requestId: this.requestId,
      },
    );
  }
}

// ─── store singleton ────────────────────────────────────────────────────────────

const spanStore = new SpanStore();

function getActiveStore(): Map<string, ISpan> {
  return spanStore.getActiveStore();
}

// ─── API pública ────────────────────────────────────────────────────────────────

export interface TelemetryInitResult {
  ok: boolean;
  hasTelemetry: boolean;
}

/** initTelemetry — inicializa o fallback store para contexto fora de request. */
export function initTelemetry(): TelemetryInitResult {
  spanStore.initFallback();
  return { ok: true, hasTelemetry: true };
}

/**
 * startTelemetry — alias de initTelemetry para clareza na camada de runtime.
 *
 * Inicializa o fallback store e retorna TelemetryInitResult.
 * Equivale a `initTelemetry()` — o nome reflete o papel
 * de "ligar" o rastreamento na sequência de inicialização do ambiente.
 *
 * Em modo postgres: ativa rastreamento de spans.
 * Em modo memory:  inicializa o fallback store (logs estruturados apenas).
 */
export function startTelemetry(): TelemetryInitResult {
  return initTelemetry();
}

/** shutdownTelemetry — fecha todos os spans abertos e reseta o fallback. */
export function shutdownTelemetry(): Promise<void> {
  const store = getActiveStore();
  for (const span of store.values()) {
    if (!span.isClosed()) {
      span.close();
    }
  }
  store.clear();
  return Promise.resolve();
}

/**
 * openSpan — cria um novo span nomeado.
 *
 * Não fecha o span automaticamente — chame `.close()` quando terminar.
 * Para uso automático, prefira `withSpan()`.
 *
 * @param name Nome do span (ex: 'coverage.find', 'order.create').
 * @returns ISpan ativo.
 */
export function openSpan(name: string): ISpan {
  const store = getActiveStore();
  // Deriva requestId do primeiro span existente ou do RequestStore
  const existing = store.values().next().value;
  const reqStore = getRequestStore();
  const requestId =
    existing?.requestId ?? reqStore?.requestId ?? 'unknown';
  const spanId = `${requestId}:${name}:${Date.now()}`;
  const span = new SpanImpl(name, requestId);
  store.set(spanId, span);
  return span;
}

/**
 * closeSpan — fecha um span por id.
 */
export function closeSpan(spanId: string): void {
  const store = getActiveStore();
  const span = store.get(spanId);
  if (span) {
    span.close();
    store.delete(spanId);
  }
}

/**
 * withSpan — abre um span, executa fn, fecha o span automaticamente.
 *
 * @param name Nome do span.
 * @param fn   Função que executa o trabalho. Recebe o span como argumento.
 * @returns Resultado de fn().
 */
export async function withSpan<T>(
  name: string,
  fn: (span: ISpan) => T | Promise<T>,
): Promise<T> {
  const span = openSpan(name);
  try {
    return await fn(span);
  } finally {
    span.close();
  }
}

/**
 * recordSpanMetric — loga duração de uma operação como métrica estruturada.
 *
 * Usado em serviços que não querem o overhead de openSpan/closeSpan.
 */
export function recordSpanMetric(
  name: string,
  durationMs: number,
  tags?: SpanTag,
): void {
  const reqStore = getRequestStore();
  const requestId = reqStore?.requestId ?? 'unknown';
  logger.info(`metric:${name}`, {
    metric: name,
    durationMs,
    ...tags,
    requestId,
  });
}

/**
 * getActiveSpanNames — retorna nomes de todos os spans abertos.
 */
export function getActiveSpanNames(): string[] {
  const spans = getActiveStore();
  return [...spans.values()].filter((s) => !s.isClosed()).map((s) => s.name);
}

/**
 * isTelemetryEnabled — retorna se o provider atual suporta telemetria.
 * Consulta a capability registrada (não acessa variáveis de ambiente diretamente).
 */
export function isTelemetryEnabled(): boolean {
  try {
    const caps = (globalThis as Record<string, unknown>)['__flux_capabilities__'] as
      | { hasTelemetry?: boolean }
      | undefined;
    return caps?.hasTelemetry ?? false;
  } catch {
    return false;
  }
}
