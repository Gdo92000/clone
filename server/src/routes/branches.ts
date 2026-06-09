import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and, inArray } from 'drizzle-orm';
import { db } from '../db';
import { branches, menuItems, additives, merchantOrders } from '../db/schema';
import { requirePermission } from '../middleware/permission';
import { requireTenantOwnership } from '../middleware/tenant';
import { requirePlanLimit } from '../middleware/planLimits';

const route = new Hono();

const idParam = z.object({ id: z.string().min(1).max(64) });

const itemIdParam = z.object({ id: z.string().min(1).max(64), itemId: z.string().min(1).max(64) });

const additiveIdParam = z.object({
  id: z.string().min(1).max(64),
  itemId: z.string().min(1).max(64),
  additiveId: z.string().min(1).max(64),
});

const additiveSchema = z.object({
  name: z.string().min(1).max(100),
  price: z.number().nonnegative().max(999.99),
});

const menuItemSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).nullable().optional(),
  category: z.string().min(1).max(80),
  price: z.number().nonnegative().max(99999.99),
  is_available: z.boolean().optional(),
});

const menuItemUpdateSchema = menuItemSchema.partial();

const upsertSchema = z.object({
  company_id: z.string().min(1).max(64),
  name: z.string().min(1).max(200),
  cep: z.string().regex(/^\d{5}-?\d{3}$/).nullable().optional(),
  address: z.string().min(1).max(200),
  number: z.string().min(1).max(20).nullable().optional(),
  neighborhood: z.string().min(1).max(120),
  city: z.string().min(1).max(120),
  state: z.string().min(2).max(2),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  delivery_radius_km: z.number().int().min(0).max(100).optional(),
});

const updateSchema = upsertSchema.partial().omit({ company_id: true });

route.get(
'/',
requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
requireTenantOwnership('companyId'),
async (c) => {
const companyId = c.get('userCompanyId') as string;
const all = await db.select().from(branches).where(eq(branches.company_id, companyId));
return c.json(all);
},
);

route.get('/:id/menu-items', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const items = await db.select().from(menuItems).where(eq(menuItems.branch_id, id));
  if (items.length === 0) return c.json([]);
  const itemIds: string[] = items.map((i) => i.id);
  const addRows = await db.select().from(additives).where(inArray(additives.menu_item_id, itemIds));
  const addMap = new Map<string, typeof addRows[number][]>();
  for (const a of addRows) {
    const list = addMap.get(a.menu_item_id) ?? [];
    list.push(a);
    addMap.set(a.menu_item_id, list);
  }
  return c.json(items.map((item) => ({ ...item, additives: addMap.get(item.id) ?? [] })));
});

route.post(
'/:id/menu-items',
requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
requireTenantOwnership('branchId'),
requirePlanLimit('products'),
zValidator('param', idParam),
  zValidator('json', menuItemSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const branchRows = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    if (branchRows.length === 0) return c.json({ error: 'Filial não encontrada' }, 404);
    const newId = crypto.randomUUID();
    const values: typeof menuItems.$inferInsert = {
      id: newId,
      branch_id: id,
      restaurant_id: id,
      name: data.name,
      description: data.description ?? null,
      category: data.category,
      price: String(data.price),
      is_available: data.is_available ?? true,
      is_visible_to_consumer: true,
    };
    await db.insert(menuItems).values(values);
    return c.json({ id: newId, ...values }, 201);
  },
);

route.put(
  '/:id/menu-items/:itemId',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', itemIdParam),
  zValidator('json', menuItemUpdateSchema),
  async (c) => {
    const { id, itemId } = c.req.valid('param');
    const data = c.req.valid('json');
    const existingRows = await db.select().from(menuItems)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId))).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Item não encontrado' }, 404);

    const update: Partial<typeof menuItems.$inferInsert> = { updated_at: new Date() };
    if (data.name !== undefined) update.name = data.name;
    if (data.description !== undefined) update.description = data.description;
    if (data.category !== undefined) update.category = data.category;
    if (data.price !== undefined) update.price = String(data.price);
    if (data.is_available !== undefined) update.is_available = data.is_available;

    await db.update(menuItems).set(update)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId)));
    return c.json({ success: true });
  },
);

route.patch(
  '/:id/menu-items/:itemId/availability',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', itemIdParam),
  zValidator('json', z.object({ is_available: z.boolean() })),
  async (c) => {
    const { id, itemId } = c.req.valid('param');
    const { is_available } = c.req.valid('json');
    const existingRows = await db.select().from(menuItems)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId))).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Item não encontrado' }, 404);

    await db.update(menuItems)
      .set({ is_available, updated_at: new Date() })
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId)));
    return c.json({ success: true, is_available });
  },
);

route.delete(
  '/:id/menu-items/:itemId',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', itemIdParam),
  async (c) => {
    const { id, itemId } = c.req.valid('param');
    const existingRows = await db.select().from(menuItems)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId))).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Item não encontrado' }, 404);

    await db.delete(menuItems)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId)));
    return c.json({ success: true });
  },
);

route.post(
  '/:id/menu-items/:itemId/additives',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', itemIdParam),
  zValidator('json', additiveSchema),
  async (c) => {
    const { id, itemId } = c.req.valid('param');
    const data = c.req.valid('json');
    const itemRows = await db.select({ id: menuItems.id }).from(menuItems)
      .where(and(eq(menuItems.branch_id, id), eq(menuItems.id, itemId))).limit(1);
    if (itemRows.length === 0) return c.json({ error: 'Item não encontrado' }, 404);
    const newId = crypto.randomUUID();
    await db.insert(additives).values({ id: newId, menu_item_id: itemId, name: data.name, price: String(data.price) });
    return c.json({ id: newId, menu_item_id: itemId, name: data.name, price: data.price }, 201);
  },
);

route.put(
  '/:id/menu-items/:itemId/additives/:additiveId',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', additiveIdParam),
  zValidator('json', additiveSchema),
  async (c) => {
    const { id: _branchId, itemId, additiveId } = c.req.valid('param');
    const data = c.req.valid('json');
    const existingRows = await db.select({ id: additives.id }).from(additives)
      .where(and(eq(additives.menu_item_id, itemId), eq(additives.id, additiveId))).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Adicional não encontrado' }, 404);
    await db.update(additives)
      .set({ name: data.name, price: String(data.price) })
      .where(eq(additives.id, additiveId));
    return c.json({ success: true });
  },
);

route.delete(
  '/:id/menu-items/:itemId/additives/:additiveId',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', additiveIdParam),
  async (c) => {
    const { id: _branchId, itemId, additiveId } = c.req.valid('param');
    const existingRows = await db.select({ id: additives.id }).from(additives)
      .where(and(eq(additives.menu_item_id, itemId), eq(additives.id, additiveId))).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Adicional não encontrado' }, 404);
    await db.delete(additives).where(eq(additives.id, additiveId));
    return c.json({ success: true });
  },
);

route.get('/:id/orders', zValidator('param', idParam), async (c) => {
  const { id } = c.req.valid('param');
  const orders = await db.select().from(merchantOrders).where(eq(merchantOrders.branch_id, id));
  return c.json(orders);
});

route.post(
'/',
requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
requirePlanLimit('branches'),
zValidator('json', upsertSchema),
async (c) => {
    const data = c.req.valid('json');
    const id = crypto.randomUUID();
    const values: typeof branches.$inferInsert = {
      id,
      company_id: data.company_id,
      name: data.name,
      cep: data.cep ?? null,
      address: data.address,
      number: data.number ?? null,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state,
      latitude: data.latitude !== undefined ? String(data.latitude) : null,
      longitude: data.longitude !== undefined ? String(data.longitude) : null,
      delivery_radius_km: data.delivery_radius_km ?? 8,
    };
    const inserted = await db.insert(branches).values(values).returning();
    if (inserted.length === 0) return c.json({ error: 'Falha ao criar filial' }, 500);
    const insertedRow = inserted[0];
    return c.json(insertedRow, 201);
  },
);

route.put(
  '/:id',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', idParam),
  zValidator('json', updateSchema),
  async (c) => {
    const { id } = c.req.valid('param');
    const data = c.req.valid('json');
    const existingRows = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Filial não encontrada' }, 404);
    const existing = existingRows[0];

    const update: Partial<typeof branches.$inferInsert> = { ...existing, updated_at: new Date() };
    if (data.name !== undefined) update.name = data.name;
    if (data.cep !== undefined) update.cep = data.cep;
    if (data.address !== undefined) update.address = data.address;
    if (data.number !== undefined) update.number = data.number;
    if (data.neighborhood !== undefined) update.neighborhood = data.neighborhood;
    if (data.city !== undefined) update.city = data.city;
    if (data.state !== undefined) update.state = data.state;
    if (data.latitude !== undefined) update.latitude = data.latitude !== null ? String(data.latitude) : null;
    if (data.longitude !== undefined) update.longitude = data.longitude !== null ? String(data.longitude) : null;
    if (data.delivery_radius_km !== undefined) update.delivery_radius_km = data.delivery_radius_km;

    const updated = await db.update(branches).set(update).where(eq(branches.id, id)).returning();
    if (updated.length === 0) return c.json({ error: 'Falha ao atualizar filial' }, 500);
    const updatedRow = updated[0];
    return c.json(updatedRow);
  },
);

route.delete(
  '/:id',
  requirePermission({ roles: ['merchant', 'admin', 'superadmin'] }),
  requireTenantOwnership('branchId'),
  zValidator('param', idParam),
  async (c) => {
    const { id } = c.req.valid('param');
    const existingRows = await db.select().from(branches).where(eq(branches.id, id)).limit(1);
    if (existingRows.length === 0) return c.json({ error: 'Filial não encontrada' }, 404);
    await db.delete(branches).where(eq(branches.id, id));
    return c.json({ success: true });
  },
);

export default route;
