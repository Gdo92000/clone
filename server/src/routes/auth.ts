import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'node:crypto';
import { eq, and, isNull, lt } from 'drizzle-orm';
import { db } from '../db';
import { users, passwordResets } from '../db/schema';
import { getAuthProvider } from '../auth';
import { authMiddleware, getTokenPayload } from '../middleware/auth';
import { rateLimit } from '../middleware/rateLimit';
import { createAuditLog } from '../services/auditLogService';
import { logger } from '../lib/logger';

const auth = new Hono();

const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(1).max(128),
});

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email().max(255),
  password: z.string().min(6).max(128),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const forgotPasswordSchema = z.object({
  email: z.string().email().max(255),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6).max(128),
});

auth.post('/login', rateLimit(10, 60_000), zValidator('json', loginSchema), async (c) => {
  const input = c.req.valid('json');
  const provider = getAuthProvider();
  const ip = c.req.header('x-forwarded-for')?.split(',')[0]?.trim() ?? c.req.header('x-real-ip');
  const userAgent = c.req.header('user-agent');

  try {
      const result = await provider.login(input, { ip, userAgent });
      return c.json(result);
    } catch (err) {
      logger.error('Auth', 'Login failed', err, { email: input.email, ip: ip ?? undefined });
      return c.json({ error: 'Email ou senha inválidos' }, 401);
    }
});

auth.post('/register', rateLimit(5, 60_000), zValidator('json', registerSchema), async (c) => {
  const input = c.req.valid('json');

  const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
  if (existing.length) {
    return c.json({ error: 'Email já cadastrado' }, 409);
  }

  const provider = getAuthProvider();
  const passwordHash = await provider.hashPassword(input.password);
  const id = crypto.randomUUID();

  await db.transaction(async (tx) => {
    await tx.insert(users).values({
      id,
      name: input.name,
      email: input.email,
      password_hash: passwordHash,
      role: 'customer',
      is_active: true,
    });

    await createAuditLog({ userId: id, action: 'REGISTER' });
  });

  return c.json({ success: true, id }, 201);
});

auth.post('/refresh', rateLimit(10, 60_000), zValidator('json', refreshSchema), async (c) => {
  const { refreshToken } = c.req.valid('json');
  const provider = getAuthProvider();

  try {
      const result = await provider.refresh(refreshToken);
      return c.json(result);
    } catch (err) {
      logger.error('Auth', 'Token refresh failed', err);
      return c.json({ error: 'Token inválido' }, 401);
    }
});

auth.post('/forgot-password', rateLimit(3, 60_000), zValidator('json', forgotPasswordSchema), async (c) => {
  const { email } = c.req.valid('json');

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);

  if (rows.length) {
    const user = rows[0];
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');

    await db.transaction(async (tx) => {
      await tx.insert(passwordResets).values({
        id: crypto.randomUUID(),
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: new Date(Date.now() + 60 * 60 * 1000),
      });

      await createAuditLog({ userId: user.id, action: 'PASSWORD_RESET_REQUESTED' });
    });
  }

  return c.json({ success: true, message: 'Se o email existir, um link de recuperação será enviado.' });
});

auth.post('/reset-password', rateLimit(5, 60_000), zValidator('json', resetPasswordSchema), async (c) => {
  const { token, password } = c.req.valid('json');
  const tokenHash = crypto.createHash('sha256').update(token, 'utf8').digest('hex');
  const provider = getAuthProvider();

  const resets = await db.select()
    .from(passwordResets)
    .where(and(
      eq(passwordResets.token_hash, tokenHash),
      isNull(passwordResets.used_at),
      lt(passwordResets.expires_at, new Date(Date.now() + 60 * 60 * 1000)),
    ))
    .limit(1);

  if (!resets.length) {
    return c.json({ error: 'Token inválido ou expirado' }, 400);
  }

  const reset = resets[0];
  if (reset.expires_at < new Date()) {
    return c.json({ error: 'Token expirado' }, 400);
  }

  const passwordHash = await provider.hashPassword(password);
  
  await db.transaction(async (tx) => {
    await tx.update(users).set({ password_hash: passwordHash }).where(eq(users.id, reset.user_id));
    await tx.update(passwordResets).set({ used_at: new Date() }).where(eq(passwordResets.id, reset.id));
    await createAuditLog({ userId: reset.user_id, action: 'PASSWORD_CHANGE' });
  });

  return c.json({ success: true, message: 'Senha alterada com sucesso.' });
});

const protectedAuth = new Hono();
protectedAuth.use('*', authMiddleware);

protectedAuth.post('/logout', async (c) => {
  try {
    const payload = getTokenPayload(c);
    if (payload?.session_id) {
      const provider = getAuthProvider();
      await provider.logout(payload.session_id);
    }
  } catch (err) { logger.error('Auth', 'Logout failed', err); }
  return c.json({ success: true });
});

protectedAuth.get('/me', async (c) => {
  try {
    const payload = getTokenPayload(c);
    if (!payload) return c.json({ error: 'Não autenticado' }, 401);
    const provider = getAuthProvider();
      const user = await provider.getCurrentUser(payload.sub);
      return c.json(user);
    } catch (err) {
      logger.error('Auth', 'Failed to get current user', err, { sub: payload.sub });
      return c.json({ error: 'Não foi possível obter dados do usuário' }, 401);
    }
});

auth.route('/', protectedAuth);

export default auth;
