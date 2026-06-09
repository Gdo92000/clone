import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companies, branches } from '../db/schema';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

route.get(
'/',
requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
requireTenantOwnership('companyId'),
async (c) => {
const companyId = c.get('userCompanyId') as string;
const result = await db.select().from(companies).where(eq(companies.id, companyId));
return c.json(result);
},
);

route.get('/:id/branches', zValidator('param', idParam), async (c) => {
const { id } = c.req.valid('param');
const companyBranches = await db.select().from(branches).where(eq(branches.company_id, id));
return c.json(companyBranches);
});

export default route;
