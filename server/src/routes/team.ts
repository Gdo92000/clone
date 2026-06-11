import { Hono } from 'hono';
import crypto from 'node:crypto';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';
import { db } from '../db';
import { users, branches } from '../db/schema';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { requirePermission } from '../middleware/permission';

import { createAuditLog } from '../services/auditLogService';
import { logger } from '../lib/logger';

const route = new Hono();

route.use('*', authMiddleware);
route.use('*', requirePermission({ permission: 'users.manage' }));

const inviteSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.email().max(255),
  role: z.enum(['company_owner', 'branch_manager', 'attendant', 'finance']),
  branch_id: z.string().min(1).max(64),
  password: z.string().min(6).max(128).optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  email: z.email().max(255).optional(),
  role: z.enum(['company_owner', 'branch_manager', 'attendant', 'finance']).optional(),
  branch_id: z.string().min(1).max(64).optional(),
  is_active: z.boolean().optional(),
});

const _ROLE_HIERARCHY: Record<string, number> = {
  attendant: 0,
  finance: 0,
  branch_manager: 1,
  company_owner: 2,
};

const MAX_ASSIGNABLE_BY_ROLE: Partial<Record<string, string[]>> = {
  branch_manager: ['attendant', 'finance', 'branch_manager'],
  company_owner: ['attendant', 'finance', 'branch_manager', 'company_owner'],
  admin: ['attendant', 'finance', 'branch_manager', 'company_owner'],
};

route.get('/', async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  if (payload.role === 'superadmin') {
    const all = await db.select({
      id: users.id, name: users.name, email: users.email, phone: users.phone,
      role: users.role, sub_role: users.sub_role, is_active: users.is_active,
      company_id: users.company_id, branch_id: users.branch_id, avatar_url: users.avatar_url, created_at: users.created_at,
    }).from(users);
    return c.json(all);
  }

  if (payload.role === 'admin' || payload.role === 'company_owner') {
    const companyUsers = await db.select({
      id: users.id, name: users.name, email: users.email, phone: users.phone,
      role: users.role, sub_role: users.sub_role, is_active: users.is_active,
      company_id: users.company_id, branch_id: users.branch_id, avatar_url: users.avatar_url, created_at: users.created_at,
    }).from(users).where(and(eq(users.company_id, payload.company_id ?? '')));
    return c.json(companyUsers);
  }

  if (payload.role === 'branch_manager') {
    const branch = c.req.query('branch_id');
    if (branch) {
      const branchUsers = await db.select({
        id: users.id, name: users.name, email: users.email, phone: users.phone,
        role: users.role, sub_role: users.sub_role, is_active: users.is_active,
        company_id: users.company_id, branch_id: users.branch_id, avatar_url: users.avatar_url, created_at: users.created_at,
      }).from(users).where(and(eq(users.branch_id, branch), eq(users.company_id, payload.company_id ?? '')));
      return c.json(branchUsers);
    }
  }

  return c.json({ error: 'Acesso não autorizado' }, 403);
});

route.get('/:id', zValidator('param', z.object({ id: z.string().min(1).max(64) })), async (c) => {
  const { id } = c.req.valid('param');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const item = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!item.length) return c.json({ error: 'Usuário não encontrado' }, 404);

  const user = item[0];

  if (payload.role !== 'superadmin') {
    if (user.company_id !== payload.company_id) {
      return c.json({ error: 'Acesso não autorizado' }, 403);
    }
  }

  const { password_hash: _pw, ...rest } = user;
  return c.json(rest);
});

route.post('/invite', zValidator('json', inviteSchema), async (c) => {
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const input = c.req.valid('json');

  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length) {
    return c.json({ error: 'Email já cadastrado' }, 409);
  }

  const branchRows = await db.select({ company_id: branches.company_id }).from(branches).where(eq(branches.id, input.branch_id)).limit(1);
  if (!branchRows.length) {
    return c.json({ error: 'Filial não encontrada' }, 404);
  }

  if (payload.role !== 'superadmin' && branchRows[0].company_id !== payload.company_id) {
    return c.json({ error: 'Filial não pertence à sua empresa' }, 403);
  }

    const inviterRole = (payload as { sub_role?: string }).sub_role ?? payload.role;
  const assignable = MAX_ASSIGNABLE_BY_ROLE[inviterRole];
  if (!assignable || !assignable.includes(input.role)) {
    return c.json({ error: `Seu perfil não permite atribuir o cargo ${input.role}` }, 403);
  }

  const passwordHash = input.password
    ? await (await import('../auth')).getAuthProvider().hashPassword(input.password)
    : null;

  const generatedPassword = input.password || crypto.randomUUID().slice(0, 10);

  if (!input.password) {
    const hash = await (await import('../auth')).getAuthProvider().hashPassword(generatedPassword);
    const id = crypto.randomUUID();
    const now = new Date();
    await db.insert(users).values({
      id,
      name: input.name,
      email: input.email,
      role: 'merchant',
      sub_role: input.role,
      password_hash: hash,
      is_active: true,
      company_id: branchRows[0].company_id,
      branch_id: input.branch_id,
      created_at: now,
      updated_at: now,
    });

    await createAuditLog({ userId: payload.sub, action: 'TEAM_INVITE', entityType: 'user', entityId: id, metadata: { name: input.name, email: input.email, role: input.role, branch_id: input.branch_id } });

    logger.info('Team member invited', { eventType: 'team_invite', userId: id, invitedBy: payload.sub, branchId: input.branch_id });

    return c.json({ success: true, id, temporaryPassword: generatedPassword }, 201);
  }

  const id = crypto.randomUUID();
  const now = new Date();
  await db.insert(users).values({
    id,
    name: input.name,
    email: input.email,
    role: 'merchant',
    sub_role: input.role,
    password_hash: passwordHash,
    is_active: true,
    company_id: branchRows[0].company_id,
    branch_id: input.branch_id,
    created_at: now,
    updated_at: now,
  });

  await createAuditLog({ userId: payload.sub, action: 'TEAM_INVITE', entityType: 'user', entityId: id, metadata: { name: input.name, email: input.email, role: input.role, branch_id: input.branch_id } });

  logger.info('Team member invited', { eventType: 'team_invite', userId: id, invitedBy: payload.sub, branchId: input.branch_id });

  return c.json({ success: true, id }, 201);
});

route.put('/:id', zValidator('param', z.object({ id: z.string().min(1).max(64) })), zValidator('json', updateSchema), async (c) => {
  const { id } = c.req.valid('param');
  const data = c.req.valid('json');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Usuário não encontrado' }, 404);

  if (payload.role !== 'superadmin' && existing[0].company_id !== payload.company_id) {
    return c.json({ error: 'Acesso não autorizado' }, 403);
  }

  if (data.role !== undefined && payload.role !== 'superadmin') {
    const updaterRole = (payload as { sub_role?: string }).sub_role ?? payload.role;
    const assignable = MAX_ASSIGNABLE_BY_ROLE[updaterRole];
    if (!assignable || !assignable.includes(data.role)) {
      return c.json({ error: `Seu perfil não permite atribuir o cargo ${data.role}` }, 403);
    }
  }

  const updateData: Record<string, unknown> = { updated_at: new Date() };
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.branch_id !== undefined) updateData.branch_id = data.branch_id;
  if (data.is_active !== undefined) updateData.is_active = data.is_active;
  if (data.role !== undefined) {
    updateData.sub_role = data.role;
    updateData.role = 'merchant';
  }

  await db.update(users).set(updateData).where(eq(users.id, id));

  await createAuditLog({ userId: payload.sub, action: 'TEAM_UPDATE', entityType: 'user', entityId: id, metadata: { changes: data } });

  return c.json({ success: true });
});

route.patch('/:id/deactivate', zValidator('param', z.object({ id: z.string().min(1).max(64) })), async (c) => {
  const { id } = c.req.valid('param');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Usuário não encontrado' }, 404);

  if (payload.role !== 'superadmin' && existing[0].company_id !== payload.company_id) {
    return c.json({ error: 'Acesso não autorizado' }, 403);
  }

  if (existing[0].sub_role === 'company_owner' && payload.role !== 'superadmin') {
    const activeOwners = await db.select({ id: users.id }).from(users)
      .where(and(eq(users.company_id, existing[0].company_id ?? ''), eq(users.sub_role, 'company_owner'), eq(users.is_active, true)));
    if (activeOwners.length <= 1) {
      return c.json({ error: 'Não é possível desativar o último company_owner da empresa' }, 403);
    }
  }

  await db.update(users).set({ is_active: false, updated_at: new Date() }).where(eq(users.id, id));

  await createAuditLog({ userId: payload.sub, action: 'TEAM_DEACTIVATE', entityType: 'user', entityId: id });

  return c.json({ success: true });
});

route.patch('/:id/reactivate', zValidator('param', z.object({ id: z.string().min(1).max(64) })), async (c) => {
  const { id } = c.req.valid('param');
  const payload = getTokenPayload(c);
  if (!payload) return c.json({ error: 'Não autenticado' }, 401);

  const existing = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!existing.length) return c.json({ error: 'Usuário não encontrado' }, 404);

  if (payload.role !== 'superadmin' && existing[0].company_id !== payload.company_id) {
    return c.json({ error: 'Acesso não autorizado' }, 403);
  }

  await db.update(users).set({ is_active: true, updated_at: new Date() }).where(eq(users.id, id));

  await createAuditLog({ userId: payload.sub, action: 'TEAM_REACTIVATE', entityType: 'user', entityId: id });

  return c.json({ success: true });
});

export default route;
