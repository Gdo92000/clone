import type { MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { companies } from '../db/schema';

export const domainMiddleware: MiddlewareHandler = async (c, next) => {
  const host = c.req.header('host');
  if (!host) { await next(); return; }

  const domain = host.split(':')[0];

  try {
    const company = await db.select({ id: companies.id })
      .from(companies)
      .where(eq(companies.custom_domain, domain))
      .limit(1);

    if (company.length) {
      c.set('resolvedCompanyId', company[0].id);
    }
  } catch {
    // DB unavailable — domain resolution is non-critical
  }

  await next();
};
