import { describe, it, expect, vi, beforeEach } from 'vitest';
import type * as SseModuleNS from './sse';

type SseModule = typeof SseModuleNS;
let mod: SseModule;
let _mockClients: Array<ReturnType<typeof createMockClient>> = [];

beforeEach(async () => {
  vi.resetModules();
  mod = await import('./sse');
    _mockClients = [];
});

function createMockClient(id: string) {
  const write = vi.fn().mockResolvedValue(undefined);
  const ping = vi.fn().mockResolvedValue(undefined);
  const close = vi.fn();
  return { id, write, ping, close };
}

describe('registerClient', () => {
  it('registers and returns a client', () => {
    const { registerClient, getStats } = mod;
    const mock = createMockClient('c1');
    const client = registerClient(mock.id, mock.write, mock.ping, mock.close);
    expect(client.id).toBe('c1');
    expect(getStats().totalClients).toBe(1);
  });

  it('starts a ping interval', () => {
    vi.useFakeTimers();
    const { registerClient } = mod;
    const mock = createMockClient('c2');
    registerClient(mock.id, mock.write, mock.ping, mock.close);
    expect(mock.ping).not.toHaveBeenCalled();
    vi.advanceTimersByTime(25_000);
    expect(mock.ping).toHaveBeenCalled();
    vi.useRealTimers();
  });

  it('close cleans up ping interval and topics', () => {
    const { registerClient, subscribe, publish, getStats } = mod;
    const mock = createMockClient('c3');
    const client = registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('c3', 'orders');
    client.close();
    expect(mock.close).toHaveBeenCalled();
    expect(getStats().totalClients).toBe(0);
    expect(publish('orders', { data: 'test' })).toBe(0);
  });

  it('removes client from topics on close', () => {
    const { registerClient, subscribe, publish } = mod;
    const mock = createMockClient('c4');
    const client = registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('c4', 'orders');
    subscribe('c4', 'notifications');
    client.close();
    expect(publish('orders', { data: 'x' })).toBe(0);
    expect(publish('notifications', { data: 'x' })).toBe(0);
  });
});

describe('subscribe / unsubscribe', () => {
  it('subscribes client to a topic', () => {
    const { registerClient, subscribe, publish } = mod;
    const mock = createMockClient('s1');
    registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('s1', 'orders');
    expect(publish('orders', { data: 'hello' })).toBe(1);
    expect(mock.write).toHaveBeenCalledWith({ data: 'hello' });
  });

  it('unsubscribes client from a topic', () => {
    const { registerClient, subscribe, unsubscribe, publish } = mod;
    const mock = createMockClient('s2');
    registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('s2', 'orders');
    unsubscribe('s2', 'orders');
    expect(publish('orders', { data: 'x' })).toBe(0);
  });

  it('subscribe to unknown client is noop', () => {
    const { subscribe, publish } = mod;
    subscribe('nonexistent', 'orders');
    expect(publish('orders', { data: 'x' })).toBe(0);
  });

  it('unsubscribe from unknown client is noop', () => {
    const { unsubscribe } = mod;
    unsubscribe('nonexistent', 'orders');
  });

  it('client can subscribe to multiple topics', () => {
    const { registerClient, subscribe, publish } = mod;
    const mock = createMockClient('s3');
    registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('s3', 'orders');
    subscribe('s3', 'notifications');
    expect(publish('orders', { data: 'o' })).toBe(1);
    expect(publish('notifications', { data: 'n' })).toBe(1);
  });
});

describe('publish', () => {
  it('sends message to all subscribers of a topic', () => {
    const { registerClient, subscribe, publish } = mod;
    const m1 = createMockClient('p1');
    const m2 = createMockClient('p2');
    registerClient(m1.id, m1.write, m1.ping, m1.close);
    registerClient(m2.id, m2.write, m2.ping, m2.close);
    subscribe('p1', 'orders');
    subscribe('p2', 'orders');
    const sent = publish('orders', { data: 'broadcast' });
    expect(sent).toBe(2);
    expect(m1.write).toHaveBeenCalledWith({ data: 'broadcast' });
    expect(m2.write).toHaveBeenCalledWith({ data: 'broadcast' });
  });

  it('returns 0 for topic with no subscribers', () => {
    expect(mod.publish('nonexistent', { data: 'x' })).toBe(0);
  });

  it('handles write errors by closing the client', async () => {
    const { registerClient, subscribe, publish } = mod;
    const mock = createMockClient('p3');
    mock.write.mockRejectedValue(new Error('connection lost'));
    registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('p3', 'orders');
    publish('orders', { data: 'will fail' });
    // write rejection is async (microtask) – wait for it
    await new Promise(r => setTimeout(r, 10));
    expect(mock.close).toHaveBeenCalled();
  });

  it('cleans up stale client references', () => {
    const { registerClient, subscribe, publish } = mod;
    const mock = createMockClient('p4');
    const client = registerClient(mock.id, mock.write, mock.ping, mock.close);
    subscribe('p4', 'orders');
    client.close();
    const sent = publish('orders', { data: 'after close' });
    expect(sent).toBe(0);
  });
});

describe('getStats', () => {
  it('returns zeros when empty', () => {
    expect(mod.getStats().totalClients).toBe(0);
    expect(mod.getStats().totalTopics).toBe(0);
  });

  it('reflects current state', () => {
    const { registerClient, subscribe, getStats } = mod;
    const m1 = createMockClient('st1');
    const m2 = createMockClient('st2');
    registerClient(m1.id, m1.write, m1.ping, m1.close);
    registerClient(m2.id, m2.write, m2.ping, m2.close);
    subscribe('st1', 'a');
    subscribe('st2', 'b');
    expect(getStats().totalClients).toBe(2);
    expect(getStats().totalTopics).toBe(2);
  });
});
