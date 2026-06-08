import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import * as cityAvailability from '../services/cityAvailabilityService';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });
const availabilityBody = z.object({
  is_active: z.boolean(),
});

route.put(
  '/:id/availability',
  authMiddleware,
  requirePermission({ roles: ['superadmin', 'admin', 'company_owner', 'branch_manager'] }),
  zValidator('param', idParam),
  zValidator('json', availabilityBody),
  async (c) => {
    const { id } = c.req.valid('param');
    const { is_active } = c.req.valid('json');
    const updated = await cityAvailability.setRestaurantAvailability(id, is_active);
    if (!updated) return c.json({ error: 'Not found' }, 404);
    return c.json(updated);
  },
);

export default route;
