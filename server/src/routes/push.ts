import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { pushSubscriptions } from '../db/schema';
import { getVapidPublicKey } from '../services/push';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { logger } from '../lib/logger';

const route = new Hono();

route.use('*', authMiddleware);

const subscribeSchema = z.object({
  endpoint: z.url(),
  keys: z.object({
    p256dh: z.string().min(1),
    auth: z.string().min(1),
  }),
  device_info: z.string().optional(),
});

route.get('/vapid-public-key', (_c) => {
  return _c.json({ publicKey: getVapidPublicKey() });
});

route.post('/subscribe', zValidator('json', subscribeSchema), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const userId = payload.sub;
  const { endpoint, keys, device_info } = c.req.valid('json');

  const existing = await db.select({ id: pushSubscriptions.id })
    .from(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint))
    .limit(1);

  if (existing.length > 0) {
    await db.update(pushSubscriptions)
      .set({ keys, device_info: device_info ?? null, user_agent: c.req.header('user-agent') ?? null })
      .where(eq(pushSubscriptions.id, existing[0].id));
    return c.json({ success: true, id: existing[0].id });
  }

  const id = crypto.randomUUID();
  await db.insert(pushSubscriptions).values({
    id,
    user_id: userId,
    endpoint,
    keys,
    device_info: device_info ?? null,
    user_agent: c.req.header('user-agent') ?? null,
  });

  logger.info('Push subscription created', { userId, deviceInfo: device_info });
  return c.json({ success: true, id }, 201);
});

route.delete('/subscribe', zValidator('json', z.object({ endpoint: z.url() })), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { endpoint } = c.req.valid('json');
  await db.delete(pushSubscriptions)
    .where(eq(pushSubscriptions.endpoint, endpoint));

  return c.json({ success: true });
});

export default route;
