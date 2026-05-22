import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companies } from '../db/schema';
import type { AppVariables } from '../types/hono';

const route = new Hono<{ Variables: Pick<AppVariables, 'resolvedCompanyId'> }>();
 
route.get('/me/theme', async (c) => {
  const companyId = c.get('resolvedCompanyId');
  if (!companyId) return c.json({ theme: 'default' }, 200);
 
  const company = await db.select({ theme_config: companies.theme_config })
    .from(companies)
    .where(eq(companies.id, companyId))
    .limit(1);
 
  return c.json({
    theme: company.length ? company[0].theme_config : 'default',
  });
});
 
export default route;
