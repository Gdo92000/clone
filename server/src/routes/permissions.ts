import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { permissions, rolePermissions } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin'] }));

route.get('/', async (c) => {
  const allPermissions = await db.select().from(permissions);
  return c.json(allPermissions);
});

route.get('/role/:role', async (c) => {
  const { role } = c.req.param();
  const userPermissions = await db.select({
    permission_id: rolePermissions.permission_id,
    name: permissions.name,
  })
    .from(rolePermissions)
    .innerJoin(permissions, eq(rolePermissions.permission_id, permissions.id))
    .where(eq(rolePermissions.role, role));
  
  return c.json(userPermissions);
});

route.post('/assign', zValidator('json', z.object({
  role: z.string(),
  permissionId: z.string(),
})), async (c) => {
  const { role, permissionId } = c.req.valid('json');
  
  const existing = await db.select().from(rolePermissions)
    .where(and(eq(rolePermissions.role, role), eq(rolePermissions.permission_id, permissionId)))
    .limit(1);

  if (!existing.length) {
    await db.insert(rolePermissions).values({ role, permission_id: permissionId });
  }
  return c.json({ success: true });
});

const roleParam = z.object({ role: z.string(), permissionId: z.string() });

route.delete('/revoke/:role/:permissionId', zValidator('param', roleParam), async (c) => {
  const { role, permissionId } = c.req.valid('param');
  await db.delete(rolePermissions)
    .where(and(eq(rolePermissions.role, role), eq(rolePermissions.permission_id, permissionId)));
  return c.json({ success: true });
});

export default route;
