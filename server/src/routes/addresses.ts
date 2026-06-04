import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db';
import { addresses } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';

const route = new Hono();

route.use('*', authMiddleware);

const idParam = z.object({ id: z.string().min(1).max(64) });

const upsertSchema = z.object({
  label: z.string().min(1).max(60).optional(),
  street: z.string().min(1).max(200),
  number: z.string().min(1).max(20),
  complement: z.string().max(100).nullable().optional(),
  neighborhood: z.string().max(120).nullable().optional(),
  city: z.string().min(1).max(120),
  state: z.string().min(2).max(2),
  zip_code: z.string().regex(/^\d{5}-?\d{3}$/).nullable().optional(),
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  is_default: z.boolean().optional(),
});

function toApi(row: typeof addresses.$inferSelect) {
  return {
    id: row.id,
    user_id: row.user_id,
    label: row.label,
    street: row.street,
    number: row.number,
    complement: row.complement,
    neighborhood: row.neighborhood,
    city: row.city,
    state: row.state,
    zip_code: row.zip_code,
    latitude: row.latitude,
    longitude: row.longitude,
    is_default: row.is_default ?? false,
    created_at: row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at),
  };
}

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const rows = await db.select().from(addresses).where(eq(addresses.user_id, payload.sub));
  return c.json(rows.map(toApi));
});

route.post('/', zValidator('json', upsertSchema), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const data = c.req.valid('json');
  const id = crypto.randomUUID();
  const values: typeof addresses.$inferInsert = {
    id,
    user_id: payload.sub,
    label: data.label ?? 'Casa',
    street: data.street,
    number: data.number,
    complement: data.complement ?? null,
    neighborhood: data.neighborhood ?? null,
    city: data.city,
    state: data.state,
    zip_code: data.zip_code ?? null,
    latitude: data.latitude !== undefined ? String(data.latitude) : null,
    longitude: data.longitude !== undefined ? String(data.longitude) : null,
    is_default: data.is_default ?? false,
  };
  if (data.is_default === true) {
    await db.update(addresses).set({ is_default: false }).where(eq(addresses.user_id, payload.sub));
  }
  const inserted = await db.insert(addresses).values(values).returning();
  if (inserted.length === 0) return c.json({ error: 'Falha ao criar endereço' }, 500);
  const insertedRow = inserted[0];
  return c.json(toApi(insertedRow), 201);
});

route.put('/:id', zValidator('param', idParam), zValidator('json', upsertSchema.partial()), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');

  const existingRows = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.user_id, payload.sub))).limit(1);
  if (existingRows.length === 0) return c.json({ error: 'Endereço não encontrado' }, 404);
  const existing = existingRows[0];

  const update: Partial<typeof addresses.$inferInsert> = { ...existing };
  if (data.label !== undefined) update.label = data.label;
  if (data.street !== undefined) update.street = data.street;
  if (data.number !== undefined) update.number = data.number;
  if (data.complement !== undefined) update.complement = data.complement;
  if (data.neighborhood !== undefined) update.neighborhood = data.neighborhood;
  if (data.city !== undefined) update.city = data.city;
  if (data.state !== undefined) update.state = data.state;
  if (data.zip_code !== undefined) update.zip_code = data.zip_code;
  if (data.latitude !== undefined) update.latitude = data.latitude !== null ? String(data.latitude) : null;
  if (data.longitude !== undefined) update.longitude = data.longitude !== null ? String(data.longitude) : null;
  if (data.is_default !== undefined) update.is_default = data.is_default;

  if (data.is_default === true) {
    await db.update(addresses).set({ is_default: false }).where(eq(addresses.user_id, payload.sub));
  }

  const updated = await db.update(addresses).set(update).where(eq(addresses.id, id)).returning();
  if (updated.length === 0) return c.json({ error: 'Falha ao atualizar endereço' }, 500);
  const updatedRow = updated[0];
  return c.json(toApi(updatedRow));
});

route.post('/:id/default', zValidator('param', idParam), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const { id } = c.req.valid('param');

  const existingRows = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.user_id, payload.sub))).limit(1);
  if (existingRows.length === 0) return c.json({ error: 'Endereço não encontrado' }, 404);

  await db.update(addresses).set({ is_default: false }).where(eq(addresses.user_id, payload.sub));
  const updated = await db.update(addresses).set({ is_default: true }).where(eq(addresses.id, id)).returning();
  if (updated.length === 0) return c.json({ error: 'Falha ao definir padrão' }, 500);
  const updatedRow = updated[0];
  return c.json(toApi(updatedRow));
});

route.delete('/:id', zValidator('param', idParam), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);
  const { id } = c.req.valid('param');

  const existingRows = await db.select().from(addresses).where(and(eq(addresses.id, id), eq(addresses.user_id, payload.sub))).limit(1);
  if (existingRows.length === 0) return c.json({ error: 'Endereço não encontrado' }, 404);

  await db.delete(addresses).where(eq(addresses.id, id));
  return c.json({ success: true });
});

export default route;
