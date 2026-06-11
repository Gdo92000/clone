import { Hono } from 'hono';
import { streamSSE } from 'hono/streaming';
import type { SSEMessage } from 'hono/streaming';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, branches } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { registerClient, subscribe, getStats } from '../services/sse';
import { logger } from '../lib/logger';

const sse = new Hono();

sse.use('*', authMiddleware);

sse.get('/orders', async (c) => {
  const jwtPayload = c.get('jwtPayload') as { sub?: string; role?: string } | undefined;
  const userId = jwtPayload?.sub;
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  const branchId = c.req.query('branch_id');

  if (branchId) {
    const user = await db.select({
      company_id: users.company_id,
      branch_id: users.branch_id,
      role: users.role,
    }).from(users).where(eq(users.id, userId)).limit(1);

    if (!user.length) return c.json({ error: 'User not found' }, 404);

    const userData = user[0];

    if (userData.role === 'superadmin') {
      // superadmin can subscribe to any branch
    } else if (userData.role === 'admin') {
      const branch = await db.select({ company_id: branches.company_id })
        .from(branches)
        .where(eq(branches.id, branchId))
        .limit(1);
      if (!branch.length || branch[0].company_id !== userData.company_id) {
        return c.json({ error: 'Acesso negado a esta filial' }, 403);
      }
    } else if (userData.role === 'merchant') {
      if (branchId !== userData.branch_id) {
        return c.json({ error: 'Acesso negado a esta filial' }, 403);
      }
    } else {
      return c.json({ error: 'Permissão insuficiente para acessar filiais' }, 403);
    }
  }

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
