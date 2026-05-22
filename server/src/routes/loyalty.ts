import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { loyaltySettings, userLoyaltyPoints, loyaltyRewards } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';

const route = new Hono();

// Consumer routes
route.use('/me/*', authMiddleware);

route.get('/me/loyalty', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const branchId = c.req.query('branch_id');
  if (!branchId) return c.json({ error: 'branch_id é obrigatório' }, 400);

  const points = await db.select().from(userLoyaltyPoints)
    .where(and(eq(userLoyaltyPoints.user_id, payload.sub), eq(userLoyaltyPoints.branch_id, branchId)))
    .limit(1);
  
  const settings = await db.select().from(loyaltySettings)
    .where(eq(loyaltySettings.branch_id, branchId))
    .limit(1);

  if (!settings.length || !settings[0].enabled) {
    return c.json({ error: 'Programa de fidelidade desativado para esta loja' }, 404);
  }

  const rewards = await db.select().from(loyaltyRewards)
    .where(and(eq(loyaltyRewards.branch_id, branchId), eq(loyaltyRewards.is_active, true)));

  return c.json({
    balance: points.length ? points[0].points_balance : 0,
    points_per_real: settings[0].points_per_real,
    rewards,
  });
});

route.post('/me/loyalty/redeem', zValidator('json', z.object({
  rewardId: z.string(),
  branchId: z.string(),
})), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const { rewardId, branchId } = c.req.valid('json');

  return await db.transaction(async (tx) => {
    const reward = await tx.select().from(loyaltyRewards)
      .where(and(eq(loyaltyRewards.id, rewardId), eq(loyaltyRewards.branch_id, branchId), eq(loyaltyRewards.is_active, true)))
      .limit(1);
    
    if (!reward.length) return c.json({ error: 'Recompensa não encontrada ou inativa' }, 404);

    const points = await tx.select().from(userLoyaltyPoints)
      .where(and(eq(userLoyaltyPoints.user_id, payload.sub), eq(userLoyaltyPoints.branch_id, branchId)))
      .limit(1);

    const currentBalance = points.length ? points[0].points_balance : 0;
    if (currentBalance < reward[0].points_required) {
      return c.json({ error: 'Pontos insuficientes' }, 400);
    }

    await tx.update(userLoyaltyPoints)
      .set({ points_balance: currentBalance - reward[0].points_required, updated_at: new Date() })
      .where(and(eq(userLoyaltyPoints.user_id, payload.sub), eq(userLoyaltyPoints.branch_id, branchId)));

    return c.json({ success: true, newBalance: currentBalance - reward[0].points_required });
  });
});

// Merchant routes
route.use('/settings/*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin', 'merchant'] }), requireTenantOwnership('branchId'));
route.use('/rewards/*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin', 'merchant'] }), requireTenantOwnership('branchId'));

route.get('/settings/:branchId', async (c) => {
  const { branchId } = c.req.param();
  const settings = await db.select().from(loyaltySettings).where(eq(loyaltySettings.branch_id, branchId)).limit(1);
  return settings.length ? c.json(settings[0]) : c.json({ enabled: false, points_per_real: '1.00' }, 200);
});

route.put('/settings/:branchId', zValidator('json', z.object({
  enabled: z.boolean().optional(),
  points_per_real: z.string().regex(/^\d+(\.\d{1,2})?$/).optional(),
})), async (c) => {
  const { branchId } = c.req.param();
  const data = c.req.valid('json');
  
  const existing = await db.select().from(loyaltySettings).where(eq(loyaltySettings.branch_id, branchId)).limit(1);
  if (existing.length) {
    await db.update(loyaltySettings).set({ ...data, updated_at: new Date() }).where(eq(loyaltySettings.branch_id, branchId));
  } else {
    await db.insert(loyaltySettings).values({ branch_id: branchId, ...data });
  }
  return c.json({ success: true });
});

route.get('/rewards/:branchId', async (c) => {
  const { branchId } = c.req.param();
  const rewards = await db.select().from(loyaltyRewards).where(eq(loyaltyRewards.branch_id, branchId));
  return c.json(rewards);
});

route.post('/rewards', zValidator('json', z.object({
  branch_id: z.string(),
  name: z.string(),
  points_required: z.number(),
  discount_value: z.string(),
  discount_type: z.enum(['percentage', 'fixed']),
})), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(loyaltyRewards).values({
    id,
    ...data,
    created_at: new Date(),
  });
  return c.json({ success: true, id }, 201);
});

route.put('/rewards/:id', zValidator('param', z.object({ id: z.string() })), zValidator('json', z.object({
  name: z.string().optional(),
  points_required: z.number().optional(),
  discount_value: z.string().optional(),
  discount_type: z.enum(['percentage', 'fixed']).optional(),
  is_active: z.boolean().optional(),
})), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  await db.update(loyaltyRewards).set(data).where(eq(loyaltyRewards.id, id));
  return c.json({ success: true });
});

route.delete('/rewards/:id', zValidator('param', z.object({ id: z.string() })), async (c) => {
  const { id } = c.req.valid('param');
  await db.delete(loyaltyRewards).where(eq(loyaltyRewards.id, id));
  return c.json({ success: true });
});

export default route;
