import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import * as coverageCityService from '../services/coverageCityService';
import { requirePermission } from '../middleware/permission';
import { authMiddleware } from '../middleware/auth';

const publicRoutes = new Hono();

publicRoutes.get('/', async (c) => {
  const cities = await coverageCityService.listCoverageCities();
  return c.json(cities);
});

publicRoutes.get('/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Not found' }, 404);
  const city = await coverageCityService.getCoverageCity(id);
  if (!city) return c.json({ error: 'Not found' }, 404);
  return c.json(city);
});

const adminRoutes = new Hono();
adminRoutes.use('*', authMiddleware, requirePermission(['superadmin', 'admin']));

const inputSchema = z.object({
  name: z.string().min(1).max(100),
  state: z.string().min(1).max(50),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusKm: z.number().int().min(1).max(200).optional(),
});

adminRoutes.post('/', zValidator('json', inputSchema), async (c) => {
  const input = c.req.valid('json');
  const city = await coverageCityService.createCoverageCity(input);
  return c.json(city, 201);
});

adminRoutes.put('/:id', zValidator('json', inputSchema.partial()), async (c) => {
  const input = c.req.valid('json');
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Not found' }, 404);
  const city = await coverageCityService.updateCoverageCity(id, input);
  if (!city) return c.json({ error: 'Not found' }, 404);
  return c.json(city);
});

adminRoutes.patch('/:id/toggle', async (c) => {
  const id = c.req.param('id');
  if (!id) return c.json({ error: 'Not found' }, 404);
  const city = await coverageCityService.toggleCoverageCity(id);
  if (!city) return c.json({ error: 'Not found' }, 404);
  return c.json(city);
});

adminRoutes.delete('/:id', async (c) => {
  const id = c.req.param('id');
  if (!id) return;
  await coverageCityService.deleteCoverageCity(id);
  return c.json({ success: true });
});

adminRoutes.post('/seed', async (c) => {
  const result = await coverageCityService.seedFromRestaurants();
  return c.json(result);
});

const route = new Hono();
route.route('/', publicRoutes);
route.route('/admin', adminRoutes);

export default route;
