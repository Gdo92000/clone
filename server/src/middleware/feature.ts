import type { MiddlewareHandler } from 'hono';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { users, subscriptions, subscriptionAddons, addons } from '../db/schema';
import { getTokenPayload } from './auth';
 
export function requireFeature(featureKey: string): MiddlewareHandler {
  return async (c, next) => {
    const payload = getTokenPayload(c);
    if (!payload) return c.json({ error: 'Não autenticado' }, 401);
 
    if (payload.role === 'superadmin') return await next();
 
    const user = await db.select().from(users).where(eq(users.id, payload.sub)).limit(1);
    if (!user.length) return c.json({ error: 'Usuário não encontrado' }, 404);
 
    const userData = user[0];
    if (!userData.company_id) return c.json({ error: 'Empresa não vinculada ao usuário' }, 403);
 
    const subscription = await db.select().from(subscriptions)
      .where(eq(subscriptions.company_id, userData.company_id))
      .limit(1);
 
    if (!subscription.length) return c.json({ error: 'Nenhuma assinatura ativa encontrada' }, 403);
 
    const hasFeature = await db.select()
      .from(subscriptionAddons)
      .innerJoin(addons, eq(subscriptionAddons.addon_id, addons.id))
      .where(and(
        eq(subscriptionAddons.subscription_id, subscription[0].company_id),
        eq(addons.feature_key, featureKey)
      ))
      .limit(1);
 
    if (hasFeature.length === 0) {
      return c.json({ error: `Funcionalidade ${featureKey} não disponível no seu plano atual. Faça upgrade para ativar.` }, 403);
    }
 
    await next();
  };
}
