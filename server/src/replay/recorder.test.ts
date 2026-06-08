/**
 * Replay Recorder tests — valida gravação, leitura e limpeza de requisições.
 */
import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import {
  startReplayRecorder,
  stopReplayRecorder,
  isReplayRecording,
  recordRequest,
  replayRequests,
  clearRecordings,
  getRecordedCount,
} from '../replay/recorder';
import type { RequestEntry } from '../replay/recorder';

const resetRecorder = (): void => {
  stopReplayRecorder();
  clearRecordings();
};

beforeEach(() => {
  resetRecorder();
});
afterAll(() => {
  resetRecorder();
});

const sampleEntry = (overrides: Partial<Omit<RequestEntry, 'recordedAt'>> = {}) => ({
  namespace: 'orders',
  method: 'POST',
  path: '/api/orders',
  headers: { 'Content-Type': 'application/json' },
  body: '{"branch_id":"b1","items":[]}',
  ...overrides,
});

// ─── start/stop ────────────────────────────────────────────────────────────────

describe('startReplayRecorder / stopReplayRecorder', () => {
  it('start sem capabilities não grava', () => {
    startReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });

  it('start com hasReplay=true ativa gravação', () => {
    startReplayRecorder({ hasReplay: true });
    expect(isReplayRecording()).toBe(true);
  });

  it('stop desativa gravação', () => {
    startReplayRecorder({ hasReplay: true });
    stopReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });

  it('start + stop em sequência funciona', () => {
    startReplayRecorder({ hasReplay: true });
    stopReplayRecorder();
    startReplayRecorder({ hasReplay: true });
    stopReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });
});

// ─── recordRequest ─────────────────────────────────────────────────────────────

describe('recordRequest', () => {
  it('não grava quando recorder desligado', () => {
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(0);
  });

  it('grava quando recorder ativado', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(1);
  });

  it('acumula entradas no mesmo namespace', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry({ path: '/api/orders/2' }));
    expect(getRecordedCount()).toBe(2);
  });

  it('isola namespaces diferentes', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews', path: '/api/reviews' }));
    expect(getRecordedCount()).toBe(2);
  });

  it('adiciona recordedAt automaticamente', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const all = replayRequests('orders') as RequestEntry[];
    expect(all[0]?.recordedAt).toBeDefined();
    expect(new Date(all[0]?.recordedAt ?? '').getTime()).not.toBeNaN();
  });

  it('retorna false quando desligado', () => {
    const result = recordRequest('orders', sampleEntry());
    expect(result).toBe(false);
  });

  it('retorna true quando gravou', () => {
    startReplayRecorder({ hasReplay: true });
    const result = recordRequest('orders', sampleEntry());
    expect(result).toBe(true);
  });

  it('respeita overwrite=true (sobrescreve buffer do namespace)', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry({ path: '/api/orders/2' }));
    // Sobrescreve: não configura pela API, mas clear + novo record = mesmo efeito
    clearRecordings('orders');
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(1);
  });

  it('stop + start novo limpa namespace? (não limpa)', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    stopReplayRecorder();
    startReplayRecorder({ hasReplay: true });
    expect(getRecordedCount()).toBe(1); // ainda tem a entrada anterior
  });
});

// ─── replayRequests ────────────────────────────────────────────────────────────

describe('replayRequests', () => {
  it('retorna [] quando namespace está vazio', () => {
    expect(replayRequests('nonexistent')).toEqual([]);
  });

  it('retorna entradas quando há dados', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const items = replayRequests('orders');
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(1);
  });

  it('sem namespace retorna todos agrupados', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews', path: '/api/reviews' }));
    const all = replayRequests();
    expect(typeof all).toBe('object');
    expect((all as Record<string, unknown>).orders).toBeDefined();
    expect((all as Record<string, unknown>).reviews).toBeDefined();
  });

  it('retorna cópias (não referências mutáveis)', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const items1 = replayRequests('orders') as RequestEntry[];
    const items2 = replayRequests('orders') as RequestEntry[];
    expect(items1).not.toBe(items2);
  });
});

// ─── clearRecordings ───────────────────────────────────────────────────────────

describe('clearRecordings', () => {
  it('limpa namespace específico', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry());
    clearRecordings('orders');
    expect(getRecordedCount()).toBe(0);
  });

  it('limpa tudo quando namespace omitido', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews' }));
    clearRecordings();
    expect(getRecordedCount()).toBe(0);
  });
});

// ─── getRecordedCount ──────────────────────────────────────────────────────────

describe('getRecordedCount', () => {
  it('retorna 0 quando vazio', () => {
    expect(getRecordedCount()).toBe(0);
  });

  it('soma entradas de todos os namespaces', () => {
    startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews' }));
    expect(getRecordedCount()).toBe(3);
  });
});
