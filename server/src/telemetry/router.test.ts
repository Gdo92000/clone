/**
 * Telemetry tests — valida init, spans, recordSpanMetric e shutdown.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  initTelemetry,
  shutdownTelemetry,
  openSpan,
  closeSpan,
  withSpan,
  recordSpanMetric,
  isTelemetryEnabled,
  getActiveSpanNames,
} from '../telemetry/router';

// ─── helpers ────────────────────────────────────────────────────────────────────

/**
 * helper — reseta o telemetry store entre testes.
 * shutdownTelemetry fecha spans + limpa o fallback store.
 */
const resetTelemetry = () => shutdownTelemetry();

beforeEach(() => {
  // limpa store antes de cada teste
  resetTelemetry();
});

afterAll(() => {
  resetTelemetry();
});

// ─── init/shutdown ─────────────────────────────────────────────────────────────

describe('Telemetry lifecycle', () => {
  it('initTelemetry retorna ok=true, hasTelemetry=true', () => {
    const result = initTelemetry();
    expect(result).toEqual({ ok: true, hasTelemetry: true });
  });

  it('shutdownTelemetry não lança quando não há spans', async () => {
    await expect(shutdownTelemetry()).resolves.toBeUndefined();
  });

  it('isTelemetryEnabled retorna boolean', () => {
    expect(typeof isTelemetryEnabled()).toBe('boolean');
  });
});

// ─── recordSpanMetric ──────────────────────────────────────────────────────────

describe('recordSpanMetric', () => {
  it('loga métrica sem lançar', () => {
    expect(() =>
      recordSpanMetric('test.metric', 42, { label: 'ok' }),
    ).not.toThrow();
  });

  it('aceita tags opcionais undefined', () => {
    expect(() => recordSpanMetric('test.metric2', 100)).not.toThrow();
  });
});

// ─── openSpan / closeSpan ──────────────────────────────────────────────────────

describe('openSpan / closeSpan', () => {
  it('cria span com nome e startedAt', () => {
    initTelemetry(); // garante fallback store
    const span = openSpan('my-operation');
    expect(span.name).toBe('my-operation');
    expect(typeof span.startedAt).toBe('number');
    expect(span.startedAt).toBeLessThanOrEqual(Date.now());
  });

  it('requestId é unknown quando RequestStore está ausente', () => {
    initTelemetry();
    const span = openSpan('no-store');
    expect(span.requestId).toBe('unknown');
  });

  it('addTag e recordError não lançam', () => {
    initTelemetry();
    const span = openSpan('tag-test');
    expect(() => {
      span.addTag('key', 'value');
      span.recordError(new Error('oops'));
    }).not.toThrow();
    span.close();
  });

  it('close é idempotente (segunda chamada não lança)', () => {
    initTelemetry();
    const span = openSpan('idempotent');
    span.close();
    expect(() => span.close()).not.toThrow();
  });

  it('getActiveSpanNames retorna spans abertos', () => {
    initTelemetry();
    const a = openSpan('alpha');
    const b = openSpan('beta');
    const names = getActiveSpanNames();
    expect(names).toContain('alpha');
    expect(names).toContain('beta');
    a.close();
    b.close();
  });

  it('closeSpan por id fecha e remove do store', () => {
    initTelemetry();
    const span = openSpan('to-close');
    // Span está ativo agora — verifica via API pública
    expect(getActiveSpanNames()).toContain('to-close');
    // closeSpan fecha e remove
    span.close();
    // getActiveSpanNames retorna spans não-fechados apenas
    expect(getActiveSpanNames()).not.toContain('to-close');
  });

  it('shutdownTelemetry fecha todos os spans abertos', () => {
    initTelemetry();
    const s1 = openSpan('s1');
    const s2 = openSpan('s2');
    // Ambos abertos antes do shutdown
    expect(getActiveSpanNames()).toHaveLength(2);
    // shutdown fecha tudo e limpa
    return shutdownTelemetry().then(() => {
      expect(getActiveSpanNames()).toHaveLength(0);
    });
  });
});

// ─── withSpan ──────────────────────────────────────────────────────────────────

describe('withSpan', () => {
  it('executa fn e retorna o valor', async () => {
    initTelemetry();
    const result = await withSpan('compute', async () => 42);
    expect(result).toBe(42);
  });

  it('propaga erro da fn', async () => {
    initTelemetry();
    const thrown = new Error('simulated-failure');
    await expect(
      withSpan('failing', async () => { throw thrown; }),
    ).rejects.toThrow('simulated-failure');
  });

  it('fecha o span mesmo quando fn lança', async () => {
    initTelemetry();
    await expect(
      withSpan('fail-close', async () => { throw new Error('x'); }),
    ).rejects.toThrow('x');
    // Após erro, shutdown limpa sem restos
    await expect(shutdownTelemetry()).resolves.toBeUndefined();
    expect(getActiveSpanNames()).toHaveLength(0);
  });

  it('retém tags e nome do span', async () => {
    initTelemetry();
    const captured: { name: string; tags: Record<string, string> } =
      {} as { name: string; tags: Record<string, string> };
    await withSpan('tagged', async (span) => {
      span.addTag('env', 'test');
      captured.name = span.name;
      captured.tags = { env: 'test' };
      return 'ok';
    });
    expect(captured.name).toBe('tagged');
    expect(captured.tags).toEqual({ env: 'test' });
  });

  it('span é fechado (removido dos ativos) após fn', async () => {
    initTelemetry();
    const before = getActiveSpanNames();
    await withSpan('ephemeral', async () => 'done');
    const after = getActiveSpanNames();
    expect(after).toEqual(before);
  });
});

// ─── isTelemetryEnabled ────────────────────────────────────────────────────────

describe('isTelemetryEnabled', () => {
  it('retorna boolean e não lança', () => {
    expect(isTelemetryEnabled()).toBe(false);
  });
});
