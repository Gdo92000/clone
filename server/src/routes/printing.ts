import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { printerConfigs, printJobs } from '../db/schema';
import { authMiddleware } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';

const route = new Hono();

route.use('*', authMiddleware, requirePermission({ roles: ['superadmin', 'admin', 'merchant'] }));

route.get('/config/:branchId', requireTenantOwnership('branchId'), async (c) => {
  const { branchId } = c.req.param();
  const [config] = await db.select().from(printerConfigs).where(eq(printerConfigs.branch_id, branchId));
  return config ? c.json(config) : c.json({ enabled: false }, 200);
});

route.put('/config/:branchId', requireTenantOwnership('branchId'), zValidator('json', z.object({
  printer_type: z.enum(['network', 'usb', 'bluetooth']).optional(),
  ip_address: z.string().optional(),
  port: z.number().optional(),
  model: z.string().optional(),
  enabled: z.boolean().optional(),
})), async (c) => {
  const { branchId } = c.req.param();
  const data = c.req.valid('json');
  
  const [existing] = await db.select().from(printerConfigs).where(eq(printerConfigs.branch_id, branchId));
  if (existing) {
    await db.update(printerConfigs).set({ ...data, updated_at: new Date() }).where(eq(printerConfigs.branch_id, branchId));
  } else {
    await db.insert(printerConfigs).values({ branch_id: branchId, ...data });
  }
  return c.json({ success: true });
});

route.get('/history/:branchId', requireTenantOwnership('branchId'), async (c) => {
  const { branchId } = c.req.param();
  const jobs = await db.select().from(printJobs).where(eq(printJobs.branch_id, branchId)).orderBy(printJobs.created_at);
  return c.json(jobs);
});

export default route;
