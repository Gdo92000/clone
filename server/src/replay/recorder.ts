/**
 * Replay Recorder — captura requisições HTTP para reexecução posterior.
 *
 * Funcionalidade:
 *  - `startReplayRecorder()`   → ativa captura
 *  - `recordRequest(entry)`    → armazena uma RequestEntry
 *  - `replayRequests()`        → retorna todos os RequestEntry gravados
 *  - `clearRecordings()`       → limpa o buffer
 *  - `stopReplayRecorder()`    → desativa captura
 *
 * Só ativo em modo memory (DATABASE_PROVIDER=memory → capabilities.hasReplay=true).
 * Em modo postgres: no-op, retorna vazio.

 * Registrador singleton por namespace — útil para múltiplos "gravações"
 * simultâneas (ex: gravar rotas de orders e de reviews separadamente).
 */
import type { RuntimeCapabilities } from '../db/provider';

// ─── tipos ──────────────────────────────────────────────────────────────────────

/**
 * RequestEntry — uma requisição HTTP capturada.
 */
export interface RequestEntry {
  /** Identificador do namespace (ex: 'orders', 'reviews'). */
  namespace: string;
  /** Método HTTP. */
  method: string;
  /** Caminho relativo (ex: '/api/orders'). */
  path: string;
  /** Headers serializáveis. */
  headers: Record<string, string>;
  /** Body como string JSON. */
  body: string;
  /** Timestamp de captura (ISO 8601). */
  recordedAt: string;
}

/** Opções do recorder por namespace. */
export interface RecorderOptions {
  /** Máximo de entradas a guardar por namespace.  0 = ilimitado. */
  maxEntries?: number;
  /** Se true, sobrescreve buffer ao invés de append. */
  overwrite?: boolean;
}

// ─── implementação ─────────────────────────────────────────────────────────────

interface RecorderState {
  entries: RequestEntry[];
  options: RecorderOptions;
}

/**
 * RecorderStore — gerenciador por namespace.
 */
class RecorderStore {
  private namespaces = new Map<string, RecorderState>();
  private _recording = false;

  /** Ativa a captura para todos os namespaces existentes. */
  startRecording(): void {
    this._recording = true;
  }

  /** Desativa a captura. */
  stopRecording(): void {
    this._recording = false;
  }

  get isRecording(): boolean {
    return this._recording;
  }

  /** Garante que um namespace existe no store. */
  private ensureNamespace(name: string, opts: RecorderOptions = {}): RecorderState {
    let state = this.namespaces.get(name);
    if (!state) {
      state = { entries: [], options: opts };
      this.namespaces.set(name, state);
    }
    return state;
  }

  /**
   * recordRequest — captura uma requisição no namespace especificado.
   *
   * Se `_recording = false`, a entrada é descartada.
   *
   * @param namespace Namespace da captura.
   * @param entry     Dados da requisição.
   * @returns true se capturada, false se gravação inativa.
   */
  recordRequest(namespace: string, entry: Omit<RequestEntry, 'recordedAt'>): boolean {
    if (!this._recording) return false;

    const state = this.ensureNamespace(namespace);
    const fullEntry: RequestEntry = {
      ...entry,
      recordedAt: new Date().toISOString(),
    };

    if (state.options.overwrite) {
      state.entries = [fullEntry];
    } else {
      state.entries.push(fullEntry);
      // aplica maxEntries se definido
      if (state.options.maxEntries && state.options.maxEntries > 0) {
        const excess = state.entries.length - state.options.maxEntries;
        if (excess > 0) {
          state.entries = state.entries.slice(excess);
        }
      }
    }

    return true;
  }

  /** Retorna todas as entradas de um namespace. */
  getRequests(namespace: string): RequestEntry[] {
    const state = this.namespaces.get(namespace);
    return state ? [...state.entries] : [];
  }

  /** Retorna todas as entradas de todos os namespaces. */
  getAllRequests(): Record<string, RequestEntry[]> {
    const result: Record<string, RequestEntry[]> = {};
    for (const [ns, state] of this.namespaces) {
      result[ns] = [...state.entries];
    }
    return result;
  }

  /** Limpa as entradas de um namespace (ou todos se vazio). */
  clear(namespace?: string): void {
    if (namespace) {
      this.namespaces.delete(namespace);
    } else {
      this.namespaces.clear();
    }
  }

  /** Retorna o número total de entradas gravadas. */
  get totalCount(): number {
    let total = 0;
    for (const state of this.namespaces.values()) {
      total += state.entries.length;
    }
    return total;
  }
}

// ─── Store singleton ────────────────────────────────────────────────────────────

const recorderStore = new RecorderStore();

// ─── API pública ────────────────────────────────────────────────────────────────

let _recording = false;

/**
 * startReplayRecorder — ativa a captura de requisições.
 *
 * Se `_capabilities?.hasReplay` for passado diretamente usa-o.
 * Caso contrário lê `__flux_capabilities__` de globalThis (setado por `initRuntime`).
 * Assim, `initRuntime` pode chamar sem argumentos e a decisão fica centralizada nas capabilities.
 */
export async function startReplayRecorder(_capabilities?: Partial<RuntimeCapabilities>): Promise<void> {
  const hasReplay = _capabilities?.hasReplay
    ?? (typeof globalThis !== 'undefined' && (globalThis as Record<string, unknown>)['__flux_capabilities__']?.hasReplay)
    ?? false;
  if (!hasReplay) return;
  _recording = true;
  recorderStore.startRecording();
}

/** stopReplayRecorder — desativa a captura. */
export async function stopReplayRecorder(): Promise<void> {
  _recording = false;
  recorderStore.stopRecording();
}

/** isReplayRecording — retorna se a captura está ativa. */
export function isReplayRecording(): boolean {
  return _recording && recorderStore.isRecording;
}

/**
 * recordRequest — captura uma requisição no namespace.
 *
 * @param namespace Namespace lógico (ex: 'orders', 'reviews').
 * @param entry      Dados da requisição (sem recordedAt).
 * @returns true se capturada.
 */
export function recordRequest(
  namespace: string,
  entry: Omit<RequestEntry, 'recordedAt'>,
): boolean {
  return recorderStore.recordRequest(namespace, entry);
}

/**
 * replayRequests — retorna todas as entradas de um namespace.
 *
 * @param namespace Namespace desejado. Se vazio, retorna todos.
 * @returns Array de RequestEntry gravadas.
 */
export function replayRequests(namespace?: string): RequestEntry[] | Record<string, RequestEntry[]> {
  if (namespace) {
    return recorderStore.getRequests(namespace);
  }
  return recorderStore.getAllRequests();
}

/**
 * clearRecordings — limpa o buffer de gravação.
 *
 * @param namespace Namespace específico. Se vazio, limpa tudo.
 */
export function clearRecordings(namespace?: string): void {
  recorderStore.clear(namespace);
}

/**
 * getRecordedCount — retorna o número de entradas gravadas.
 */
export function getRecordedCount(): number {
  return recorderStore.totalCount;
}
