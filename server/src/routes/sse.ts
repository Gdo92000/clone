import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { SSEMessage } from 'hono/streaming';
import { authMiddleware } from '../middleware/auth';
import { registerClient, subscribe, getStats } from '../services/sse';
import { logger } from '../lib/logger';

const sse = new Hono();

sse.use('*', authMiddleware);

sse.get('/orders', (c) => {
  const jwtPayload = c.get('jwtPayload') as { sub?: string } | undefined;
  const userId = jwtPayload?.sub;
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const branchId = c.req.query('branch_id');

  return streamSSE(c, async (stream) => {
    const clientId = `sse:${userId}:${crypto.randomUUID().slice(0, 8)}`;

    registerClient(
      clientId,
      (msg: SSEMessage) => stream.writeSSE(msg),
      () => stream.writeSSE({ event: 'ping', data: '' }),
      () => undefined,
    );

    subscribe(clientId, `user:${userId}`);
    if (branchId) subscribe(clientId, `branch:${branchId}`);

    logger.info(`SSE client connected`, { clientId, userId, branchId });

    const connectedMsg: SSEMessage = { event: 'connected', data: JSON.stringify({ clientId }) };
    await stream.writeSSE(connectedMsg);

    for (;;) {
      const heartbeat: SSEMessage = { event: 'heartbeat', data: '' };
      await stream.writeSSE(heartbeat);
      await new Promise((resolve) => setTimeout(resolve, 25_000));
    }
  });
});

sse.get('/stats', (_c) => {
  return _c.json(getStats());
});

export default sse;
