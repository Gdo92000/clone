import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { csrf } from 'hono/csrf';
import { logger } from 'hono/logger';
import { serve } from '@hono/node-server';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { restaurants, menuItems } from './db/schema';
import operationsRoutes from './routes/operations';
import holidaysRoutes from './routes/holidays';
import authRoutes from './routes/auth';
import globalCouponsRoutes from './routes/global-coupons';
import merchantCouponsRoutes from './routes/merchant-coupons';
import campaignsRoutes from './routes/campaigns';
import plansRoutes from './routes/plans';
import subscriptionsRoutes from './routes/subscriptions';
import subscriptionAddonsRoutes from './routes/subscription-addons';
import invoicesRoutes from './routes/invoices';
import adminUsersRoutes from './routes/admin-users';
import addonsRoutes from './routes/addons';
import featureFlagsRoutes from './routes/feature-flags';
import capabilitiesRoutes from './routes/capabilities';
import notificationsRoutes from './routes/notifications';
import auditEventsRoutes from './routes/audit-events';
import supportTicketsRoutes from './routes/support-tickets';
import userNotificationsRoutes from './routes/user-notifications';
import branchSettingsRoutes from './routes/branch-settings';
import commissionPlansRoutes from './routes/commission-plans';
import adminReportsRoutes from './routes/admin-reports';
import loyaltyRoutes from './routes/loyalty';
import couponEngineRoutes from './routes/coupons-engine';
import themeRoutes from './routes/theme';
import printingRoutes from './routes/printing';
import { authMiddleware } from './middleware/auth';
import { requirePermission } from './middleware/permission';
import { requestId } from './middleware/requestId';
import { securityHeaders } from './middleware/securityHeaders';
import { domainMiddleware } from './middleware/domain';
import { ALLOWED_ORIGINS } from './config';
import { errorHandler } from './lib/errors';
import { logger as appLogger } from './lib/logger';
import { checkHealth, READY_STATE } from './lib/health';
import { metricsHandler, getMetrics } from './middleware/metrics';
import { startSessionCleanup } from './services/cleanupAuthSessions';
import * as coverageCityService from './services/coverageCityService';
import { restaurantSchema } from '../../shared/validations/restaurant';
import categoriesRoutes from './routes/categories';
import menuItemsRoutes from './routes/menu-items';
import companiesRoutes from './routes/companies';
import branchesRoutes from './routes/branches';
import ordersRoutes from './routes/orders';
import coverageCitiesRoutes from './routes/coverage-cities';
import consumerReviewsRoutes from './routes/consumer-reviews';
import consumerSupportRoutes from './routes/consumer-support';
import consumerOrdersRoutes from './routes/consumer-orders';
import permissionsRoutes from './routes/permissions';
import { reviews } from './db/schema';
import type { TokenPayload } from './auth/types';

const app = new Hono();

app.use('*', requestId);
app.use('*', securityHeaders);
app.use('*', csrf());
app.use('*', domainMiddleware);
app.use('*', cors({
  origin: (origin) => {
    if (!origin) return origin;
    if (ALLOWED_ORIGINS.includes(origin)) return origin;
    return undefined;
  },
  credentials: true,
}));
app.use('*', logger());

app.use('*', metricsHandler);

app.onError(errorHandler);

app.get('/api/metrics', async (c) => {
  c.header('Content-Type', 'text/plain');
  return c.body(await getMetrics());
});

// Public routes
app.get('/api/health/live', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString(), uptime: process.uptime(), requestId: c.get('requestId') });
});

app.get('/api/health/ready', async (c) => {
  const result = await checkHealth(c.get('requestId'));
  if (result.database === 'down') return c.json(result, 503);
  return c.json(result);
});

app.get('/api/health', async (c) => {
  return c.json(await checkHealth(c.get('requestId')));
});

app.route('/api/auth', authRoutes);

const idParam = z.object({ id: z.string().min(1).max(64) });

app.get('/api/restaurants', async (c) => {
  const all = await db.select().from(restaurants);
  return c.json(all);
});

app.get('/api/restaurants/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  if (!restaurant.length) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant[0]);
});

app.get('/api/restaurants/:id/menu-items', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const items = await db.select().from(menuItems).where(eq(menuItems.restaurant_id, id));
  return c.json(items);
});

app.route('/api/categories', categoriesRoutes);
app.route('/api/menu-items', menuItemsRoutes);
app.route('/api/coverage-cities', coverageCitiesRoutes);
app.route('/api/reviews', consumerReviewsRoutes);
app.route('/api/plans', plansRoutes);
app.route('/api/capabilities', capabilitiesRoutes);
app.route('/api/theme', themeRoutes);

// Protected routes (require JWT)
const api = new Hono();
api.use('*', authMiddleware);

api.post('/restaurants', zValidator('json', restaurantSchema), requirePermission({ roles: ['superadmin', 'admin'] }), async (c) => {
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const slug = data.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  await db.insert(restaurants).values({
    id,
    name: data.name,
    slug,
    cuisine: data.cuisine,
    description: data.description ?? null,
    category_id: data.categoryId ?? null,
    address: data.address,
    number: data.number ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city,
    state: data.state,
    zip_code: data.zipCode ?? null,
    phone: data.phone ?? null,
    delivery_fee: data.deliveryFee !== undefined ? String(data.deliveryFee) : null,
    delivery_time: data.deliveryTime ?? null,
    latitude: data.latitude !== undefined ? String(data.latitude) : null,
    longitude: data.longitude !== undefined ? String(data.longitude) : null,
  } as typeof restaurants.$inferInsert);

  return c.json({ success: true, id }, 201);
});

api.route('/companies', companiesRoutes);
api.route('/branches', branchesRoutes);
api.route('/orders', ordersRoutes);
api.route('/operations', operationsRoutes);
api.route('/holidays', holidaysRoutes);
api.route('/global-coupons', globalCouponsRoutes);
api.route('/merchant-coupons', merchantCouponsRoutes);
api.route('/campaigns', campaignsRoutes);
api.route('/subscriptions', subscriptionsRoutes);
api.route('/subscription-addons', subscriptionAddonsRoutes);
api.route('/invoices', invoicesRoutes);
api.route('/admin/users', adminUsersRoutes);
api.route('/addons', addonsRoutes);
api.route('/feature-flags', featureFlagsRoutes);
api.route('/notifications', notificationsRoutes);
api.route('/audit-events', auditEventsRoutes);
api.route('/support-tickets', supportTicketsRoutes);
api.route('/support-tickets', consumerSupportRoutes);
api.route('/me/orders', consumerOrdersRoutes);
api.route('/me/notifications', userNotificationsRoutes);
api.route('/branch-settings', branchSettingsRoutes);
api.route('/commission-plans', commissionPlansRoutes);
api.route('/admin/reports', adminReportsRoutes);
api.route('/loyalty', loyaltyRoutes);
api.route('/coupons/validate', couponEngineRoutes);
api.route('/printing', printingRoutes);
api.route('/permissions', permissionsRoutes);








const reviewCreateSchema = z.object({
  restaurant_id: z.string().min(1).max(64),
  order_id: z.string().min(1).max(64).optional(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

api.post('/reviews', zValidator('json', reviewCreateSchema), async (c) => {
  const payload = c.get('jwtPayload') as TokenPayload | undefined;
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  await db.insert(reviews).values({
    id,
    user_id: payload.sub,
    restaurant_id: data.restaurant_id,
    order_id: data.order_id ?? null,
    rating: data.rating,
    comment: data.comment ?? null,
    created_at: new Date(),
  } as typeof reviews.$inferInsert);
  return c.json({ success: true, id }, 201);
});

app.route('/api', api);

const port = Number(process.env.PORT) || 3001;

const server = serve({ fetch: app.fetch, port }, () => {
  READY_STATE.ready = true;
  appLogger.info(`Server started`, { port, nodeEnv: process.env.NODE_ENV ?? 'development' });
});

startSessionCleanup();
coverageCityService.seedFromRestaurants().catch((err) => {
  appLogger.error('Coverage city seed failed', err instanceof Error ? err : new Error(String(err)));
});

function shutdown(signal: string) {
  appLogger.info(`${signal} received — shutting down gracefully`, { signal });
  READY_STATE.ready = false;
  server.close(() => {
    appLogger.info('HTTP server closed');
    process.exit(0);
  });
  setTimeout(() => {
    appLogger.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

export default app;
