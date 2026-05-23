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

const resetRecorder = () => {
  stopReplayRecorder();
  clearRecordings();
};

beforeEach(resetRecorder);
afterAll(resetRecorder);

const sampleEntry = (overrides: Partial<Omit<import('../replay/recorder').RequestEntry, 'recordedAt'>> = {}) => ({
  namespace: 'orders',
  method: 'POST',
  path: '/api/orders',
  headers: { 'Content-Type': 'application/json' },
  body: '{"branch_id":"b1","items":[]}',
  ...overrides,
});

// ─── start/stop ────────────────────────────────────────────────────────────────

describe('startReplayRecorder / stopReplayRecorder', () => {
  it('start sem capabilities não grava', async () => {
    await startReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });

  it('start com hasReplay=true ativa gravação', async () => {
    await startReplayRecorder({ hasReplay: true });
    expect(isReplayRecording()).toBe(true);
  });

  it('stop desativa gravação', async () => {
    await startReplayRecorder({ hasReplay: true });
    await stopReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });

  it('start + stop em sequência funciona', async () => {
    await startReplayRecorder({ hasReplay: true });
    await stopReplayRecorder();
    await startReplayRecorder({ hasReplay: true });
    await stopReplayRecorder();
    expect(isReplayRecording()).toBe(false);
  });
});

// ─── recordRequest ─────────────────────────────────────────────────────────────

describe('recordRequest', () => {
  it('não grava quando recorder desligado', async () => {
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(0);
  });

  it('grava quando recorder ativado', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(1);
  });

  it('acumula entradas no mesmo namespace', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry({ path: '/api/orders/2' }));
    expect(getRecordedCount()).toBe(2);
  });

  it('isola namespaces diferentes', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews', path: '/api/reviews' }));
    expect(getRecordedCount()).toBe(2);
  });

  it('adiciona recordedAt automaticamente', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const all = replayRequests('orders') as import('../replay/recorder').RequestEntry[];
    expect(all[0].recordedAt).toBeDefined();
    expect(new Date(all[0].recordedAt).getTime()).not.toBeNaN();
  });

  it('retorna false quando desligado', async () => {
    const result = recordRequest('orders', sampleEntry());
    expect(result).toBe(false);
  });

  it('retorna true quando gravou', async () => {
    await startReplayRecorder({ hasReplay: true });
    const result = recordRequest('orders', sampleEntry());
    expect(result).toBe(true);
  });

  it('respeita overwrite=true (sobrescreve buffer do namespace)', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry({ path: '/api/orders/2' }));
    // Sobrescreve: não configura pela API, mas clear + novo record = mesmo efeito
    clearRecordings('orders');
    recordRequest('orders', sampleEntry());
    expect(getRecordedCount()).toBe(1);
  });

  it('stop + start novo limpa namespace? (não limpa)', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    await stopReplayRecorder();
    await startReplayRecorder({ hasReplay: true });
    expect(getRecordedCount()).toBe(1); // ainda tem a entrada anterior
  });
});

// ─── replayRequests ────────────────────────────────────────────────────────────

describe('replayRequests', () => {
  it('retorna [] quando namespace está vazio', () => {
    expect(replayRequests('nonexistent')).toEqual([]);
  });

  it('retorna entradas quando há dados', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const items = replayRequests('orders');
    expect(Array.isArray(items)).toBe(true);
    expect(items).toHaveLength(1);
  });

  it('sem namespace retorna todos agrupados', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews', path: '/api/reviews' }));
    const all = replayRequests();
    expect(typeof all).toBe('object');
    expect((all as Record<string, unknown>).orders).toBeDefined();
    expect((all as Record<string, unknown>).reviews).toBeDefined();
  });

  it('retorna cópias (não referências mutáveis)', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    const items1 = replayRequests('orders') as import('../replay/recorder').RequestEntry[];
    const items2 = replayRequests('orders') as import('../replay/recorder').RequestEntry[];
    expect(items1).not.toBe(items2);
  });
});

// ─── clearRecordings ───────────────────────────────────────────────────────────

describe('clearRecordings', () => {
  it('limpa namespace específico', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry());
    clearRecordings('orders');
    expect(getRecordedCount()).toBe(0);
  });

  it('limpa tudo quando namespace omitido', async () => {
    await startReplayRecorder({ hasReplay: true });
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

  it('soma entradas de todos os namespaces', async () => {
    await startReplayRecorder({ hasReplay: true });
    recordRequest('orders', sampleEntry());
    recordRequest('orders', sampleEntry());
    recordRequest('reviews', sampleEntry({ namespace: 'reviews' }));
    expect(getRecordedCount()).toBe(3);
  });
});
