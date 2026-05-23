/**
 * IndexedDB storage service — offline persistence layer.
 *
 * Features:
 *  - `openStore(dbName, version)`  → abre/ cria o banco com os object stores
 *  - `setItem(store, key, value)`  → escreve um valor
 *  - `getItem(store, key)`         → lê um valor (null se não existir)
 *  - `removeItem(store, key)`      → remove uma entrada
 *  - `clear(store)`                → remove todas as entradas do store
 *  - `close()`                      → fecha a conexão
 *
 * Mutation queue primitivos para replay de ações offline:
 *  - `enqueue(mutation)`           → adiciona uma mutação à fila
 *  - `dequeueAll()`                ← retorna todas e limpa a fila
 *  - `getQueueLength()`            → número de mutações na fila
 *
 * Reconnect sync: `ReconnectSync` classe rastreia estado e expõe `onSync/clearSyncData`.
 *
 * Só funcional em navegador (`window.indexedDB`). Em servidor (Node) degrade no-ops.
 */

// ─── tipos ──────────────────────────────────────────────────────────────────────

export interface StoredMutation {
  id: string;
  type: string;
  payload: unknown;
  timestamp: string;
  synced: boolean;
}

export interface StorageRecord {
  key: string;
  value: unknown;
}

type DbMapNames = 'mutation_queue' | 'cached_establishments' | 'cached_cities';

// ─── DB Singleton ───────────────────────────────────────────────────────────────

let _db: IDBDatabase | null = null;
let _dbReadyPromise: Promise<IDBDatabase> | null = null;

/** Abre a conexão IndexedDB — cria ou atualiza o schema. */
function openDb(): Promise<IDBDatabase> {
  if (_db) return Promise.resolve(_db);
  if (_dbReadyPromise) return _dbReadyPromise;

  if (typeof indexedDB === 'undefined') {
    return Promise.reject(new Error('IndexedDB não suportado neste ambiente.'));
  }

  _dbReadyPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('FluxDeliveryDB', 1);

    request.onerror = () => { reject(new Error('Falha ao abrir IndexedDB')); };
    request.onsuccess = () => {
      _db = request.result;
      _db.onversionchange = () => _db?.close();
      _dbReadyPromise = null;
      resolve(_db);
    };

    request.onupgradeneeded = (ev) => {
      const db = (ev.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('mutation_queue')) {
        const mutationStore = db.createObjectStore('mutation_queue', { keyPath: 'id' });
        mutationStore.createIndex('synced', 'synced', { unique: false });
      }

      if (!db.objectStoreNames.contains('cached_establishments')) {
        db.createObjectStore('cached_establishments', { keyPath: 'key' });
      }

      if (!db.objectStoreNames.contains('cached_cities')) {
        db.createObjectStore('cached_cities', { keyPath: 'key' });
      }
    };
  });

  return _dbReadyPromise;
}

// ─── helpers ────────────────────────────────────────────────────────────────────

/**
 * txStore — abre uma transação IDB no store correto.
 * Usa `fn` que retorna `IDBRequest<any>` para contornar restrição do
 * `this` tipo de IDBRequest (TypeScript não aceita variância de `this` na assinatura).
 */
async function txStore<TReturn>(
  storeName: DbMapNames,
  mode: IDBTransactionMode,
  fn: (store: IDBObjectStore) => IDBRequest,
): Promise<TReturn> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = fn(store);
    transaction.oncomplete = () => { resolve(request.result as TReturn); };
    transaction.onerror = () => {
      reject((transaction as IDBTransaction & { error: Error }).error);
    };
    transaction.onabort = () => {
      reject((transaction as IDBTransaction & { error: Error }).error);
    };
  });
}

/** shorthand compat — aliases txStore */
const tx = txStore;

// ─── storageService API ──────────────────────────────────────────────────────────

/** Fecha a conexão aberta. */
export function closeStore(): void {
  _db?.close();
  _db = null;
  _dbReadyPromise = null;
}

// ─── item helpers ────────────────────────────────────────────────────────────────

export async function setItem(storeName: DbMapNames, key: string, value: unknown): Promise<void> {
  await tx(storeName, 'readwrite',
    (store) => store.put({ key, value }));
}

export async function getItem(storeName: DbMapNames, key: string): Promise<unknown> {
  const record = await tx<StorageRecord | undefined>(storeName, 'readonly',
    (store) => store.get(key));
  return (record)?.value ?? null;
}

export async function removeItem(storeName: DbMapNames, key: string): Promise<void> {
  await tx(storeName, 'readwrite', (store) => store.delete(key));
}

export async function clearStore(): Promise<void> {
  await tx('cached_establishments', 'readwrite', (store) => store.clear());
}

// Overloads para compatibilidade com APIs de store
export async function getAllFromStore(): Promise<unknown[]> {
  const records = await tx<StorageRecord[]>('cached_establishments', 'readonly', (store) => store.getAll());
  return records.map((r) => r.value);
}
// ─── mutation queue ──────────────────────────────────────────────────────────────

/**
 * enqueueMutation — adiciona uma mutação offline à fila para sincronização posterior.
 * Normaliza `type` em maiúsculas + underscore para chave estável.
 */
export async function enqueueMutation(type: string, payload: unknown): Promise<void> {
  const id = `${type}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;
  const mutation: StoredMutation = {
    id,
    type: type.toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
    payload,
    timestamp: new Date().toISOString(),
    synced: false,
  };
  await tx<StoredMutation>('mutation_queue', 'readwrite', (store) => store.put(mutation));
}

/**
 * dequeueAll — retorna todas as mutações na fila e limpa-a.
 * Útil ao reconectar e reenviar ações offline acumuladas.
 */
export async function dequeueAll(): Promise<StoredMutation[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('mutation_queue', 'readwrite');
    const store = tx.objectStore('mutation_queue');
    const getAllReq = store.getAll();

    getAllReq.onsuccess = () => {
      const mutations = getAllReq.result as StoredMutation[];
      store.clear();
      resolve(mutations);
    };
    getAllReq.onerror = () => { reject(new Error('Falha ao ler mutation_queue')); };
  });
}

/** getQueueLength — número de mutações pendentes. */
export async function getQueueLength(): Promise<number> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const countReq = db.transaction('mutation_queue', 'readonly')
      .objectStore('mutation_queue').count();
    countReq.onsuccess = () => { resolve(countReq.result); };
    countReq.onerror = () => {
      reject(new Error(countReq.error ? `Falha ao contar mutation_queue: ${countReq.error.message}` : 'Falha ao contar mutation_queue'));
    };
  });
}

// ─── ReconnectSync ───────────────────────────────────────────────────────────────

/**
 * ReconnectSync — rastreia o último estado de sincronização conhecido
 * e expõe hooks para Observer Pattern após reconexão.
 */
export class ReconnectSync {
  private _isConnected = false;
  private _listeners = new Set<() => void>();
  private _lastSyncAt: string | null = null;

  get isConnected(): boolean {
    return this._isConnected;
  }

  get lastSyncAt(): string | null {
    return this._lastSyncAt;
  }

  /** Marca conexão ONLINE. Dispara listeners. */
  onConnect(): void {
    this._isConnected = true;
    this._lastSyncAt = new Date().toISOString();
    const listeners = [...this._listeners];
    listeners.forEach((fn) => {
      try { fn(); } catch { /* ignore listener errors */ }
    });
  }

  /** Marca conexão OFFLINE. */
  onDisconnect(): void {
    this._isConnected = false;
  }

  /** Registra callback disparado após qualquer onConnect/onDisconnect. */
  onSync(fn: () => void): () => void {
    this._listeners.add(fn);
    return () => { this._listeners.delete(fn); };
  }

  /** Limpa dados de sincronização (usado em logout/reset). */
  clearSyncData(): void {
    this._lastSyncAt = null;
    this._isConnected = false;
  }
}

// Singleton por página — não reinstancia entre chamadas
let _reconnectSync: ReconnectSync | null = null;

export function getReconnectSync(): ReconnectSync {
  if (!_reconnectSync) _reconnectSync = new ReconnectSync();
  return _reconnectSync;
}
