import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../db';
import { users } from '../db/schema';
import { JWT_SECRET } from '../config';

const auth = new Hono();

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');

  const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (!rows.length) {
    return c.json({ error: 'Usuário ou senha inválidos' }, 401);
  }

  const user = rows[0];

  if (!user.password_hash) {
    return c.json({ error: 'Usuário ou senha inválidos' }, 401);
  }

  const passwordMatch = await bcrypt.compare(password, user.password_hash);
  if (!passwordMatch) {
    return c.json({ error: 'Usuário ou senha inválidos' }, 401);
  }

  const token = await sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    },
    JWT_SECRET
  );

  return c.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar_url: user.avatar_url ?? '',
      active: true,
    },
    token,
  });
});

auth.post('/logout', async (c) => {
  return c.json({ success: true });
});

export default auth;
