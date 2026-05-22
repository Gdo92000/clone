import type { SSEMessage } from 'hono/streaming';
import { logger } from '../lib/logger';

interface SseClient {
  id: string;
  topics: Set<string>;
  write: (message: SSEMessage) => Promise<void>;
  ping: () => Promise<void>;
  close: () => void;
}

const clients = new Map<string, SseClient>();
const topics = new Map<string, Set<string>>();

const PING_INTERVAL = 25_000;

export function registerClient(
  id: string,
  write: (msg: SSEMessage) => Promise<void>,
  ping: () => Promise<void>,
  close: () => void,
): SseClient {
  const client: SseClient = { id, topics: new Set(), write, ping, close };
  clients.set(id, client);

  const pingTimer = setInterval(() => {
    ping().catch(() => { client.close(); });
  }, PING_INTERVAL);

  const origClose = client.close.bind(client);
  client.close = () => {
    clearInterval(pingTimer);
    for (const topic of client.topics) {
      const subs = topics.get(topic);
      if (subs) {
        subs.delete(id);
        if (subs.size === 0) topics.delete(topic);
      }
    }
    clients.delete(id);
    origClose();
  };

  return client;
}

export function subscribe(clientId: string, topic: string): void {
  const client = clients.get(clientId);
  if (!client) return;
  client.topics.add(topic);
  if (!topics.has(topic)) topics.set(topic, new Set());
  const subs = topics.get(topic);
  if (subs) subs.add(clientId);
}

export function unsubscribe(clientId: string, topic: string): void {
  const client = clients.get(clientId);
  if (!client) return;
  client.topics.delete(topic);
  const subs = topics.get(topic);
  if (subs) {
    subs.delete(clientId);
    if (subs.size === 0) topics.delete(topic);
  }
}

export function publish(topic: string, message: SSEMessage): number {
  const subs = topics.get(topic);
  if (!subs || subs.size === 0) return 0;

  let sent = 0;
  for (const clientId of subs) {
    const client = clients.get(clientId);
    if (!client) {
      subs.delete(clientId);
      continue;
    }
    client.write(message).catch((err: unknown) => {
      logger.warn(`SSE write failed for client ${clientId}`, { error: String(err), topic });
      client.close();
    });
    sent++;
  }
  return sent;
}

export function getStats(): { totalClients: number; totalTopics: number } {
  return {
    totalClients: clients.size,
    totalTopics: topics.size,
  };
}
