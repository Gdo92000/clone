type ToastType = 'success' | 'error' | 'info' | 'warning';

interface QueueItem {
  id: string;
  message: string;
  type: ToastType;
  priority: number;
  timestamp: number;
}

const PRIORITY: Record<ToastType, number> = {
  error: 4,
  warning: 3,
  info: 2,
  success: 1,
};

const DEDUP_WINDOW = 3000;

let queue: QueueItem[] = [];
let listeners: (() => void)[] = [];

function notify(): void {
  for (const listener of listeners) listener();
}

export function isDuplicate(message: string): boolean {
  const now = Date.now();
  return queue.some(
    (item) => item.message === message && now - item.timestamp < DEDUP_WINDOW,
  );
}

export function enqueue(message: string, type: ToastType): string {
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;

  if (isDuplicate(message)) return id;

  const item: QueueItem = {
    id,
    message,
    type,
    priority: PRIORITY[type],
    timestamp: Date.now(),
  };

  queue = [...queue, item].sort((a, b) => b.priority - a.priority);
  notify();

  return id;
}

export function dequeue(): QueueItem | null {
  if (queue.length === 0) return null;

  const item = queue[queue.length - 1] ?? null;
  if (item) {
    queue = queue.slice(0, -1);
    notify();
  }
  return item;
}

export function removeFromQueue(id: string): void {
  queue = queue.filter((item) => item.id !== id);
  notify();
}

export function clearQueue(): void {
  queue = [];
  notify();
}

export function subscribe(listener: () => void): () => void {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function getQueue(): QueueItem[] {
  return [...queue];
}

export function getQueueLength(): number {
  return queue.length;
}