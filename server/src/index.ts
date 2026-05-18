import { Hono } from 'hono';
import { cors } from 'hono/cors';
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
import { authMiddleware } from './middleware/auth';
import { ALLOWED_ORIGINS } from './config';
import { errorHandler } from './lib/errors';
import { restaurantSchema } from '../../shared/validations/restaurant';
import categoriesRoutes from './routes/categories';
import menuItemsRoutes from './routes/menu-items';
import companiesRoutes from './routes/companies';
import branchesRoutes from './routes/branches';
import ordersRoutes from './routes/orders';

const app = new Hono();

app.use('*', cors({ origin: ALLOWED_ORIGINS, credentials: true }));
app.use('*', logger());

app.onError(errorHandler);

// Public routes
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.route('/api/auth', authRoutes);

// Protected routes (require JWT)
const api = new Hono();
api.use('*', authMiddleware);

const idParam = z.object({ id: z.string().min(1).max(64) });

api.get('/restaurants', async (c) => {
  const all = await db.select().from(restaurants);
  return c.json(all);
});

api.get('/restaurants/:id', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const restaurant = await db.select().from(restaurants).where(eq(restaurants.id, id)).limit(1);
  if (!restaurant.length) return c.json({ error: 'Not found' }, 404);
  return c.json(restaurant[0]);
});

api.get('/restaurants/:id/menu-items', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const items = await db.select().from(menuItems).where(eq(menuItems.restaurant_id, id));
  return c.json(items);
});

api.post('/restaurants', zValidator('json', restaurantSchema), async (c) => {
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

api.route('/categories', categoriesRoutes);
api.route('/menu-items', menuItemsRoutes);
api.route('/companies', companiesRoutes);
api.route('/branches', branchesRoutes);
api.route('/orders', ordersRoutes);
api.route('/operations', operationsRoutes);
api.route('/holidays', holidaysRoutes);

app.route('/api', api);

export default app;

const port = Number(process.env.PORT) || 3001;
serve({ fetch: app.fetch, port });
console.log(`Server running on http://localhost:${port}`);
