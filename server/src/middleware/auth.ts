import type { MiddlewareHandler, Context } from 'hono';
import { jwt } from 'hono/jwt';
import { eq, and, isNull } from 'drizzle-orm';
import { db } from '../db';
import { authSessions } from '../db/schema';
import { getJwtSecret } from '../config';
import type { TokenPayload } from '../auth/types';

export function getAuthMiddleware(): MiddlewareHandler {
  return jwt({ secret: getJwtSecret(), alg: 'HS256' });
}

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const jwtMiddleware = getAuthMiddleware();
  let jwtPassed = false;

  await jwtMiddleware(c, async () => {
    jwtPassed = true;
  });

  if (!jwtPassed) return;

  const payload = c.get('jwtPayload') as TokenPayload | undefined;
  if (payload?.session_id) {
    const sessions = await db.select({ revoked_at: authSessions.revoked_at, expires_at: authSessions.expires_at })
      .from(authSessions)
      .where(and(eq(authSessions.id, payload.session_id), isNull(authSessions.revoked_at)))
      .limit(1);

    if (!sessions.length) {
      c.status(401);
      return c.json({ error: 'Sessão revogada ou inexistente' });
    }

    if (sessions[0].expires_at && new Date(sessions[0].expires_at) < new Date()) {
      c.status(401);
      return c.json({ error: 'Sessão expirada' });
    }
  }

  await next();
};

export function getTokenPayload(c: Context): TokenPayload | null {
  try {
    const payload = c.get('jwtPayload');
    if (payload && typeof payload.sub === 'string') {
      return {
        sub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : '',
        role: typeof payload.role === 'string' ? payload.role : '',
        session_id: payload.session_id,
      };
    }
    return null;
  } catch {
    return null;
  }
}
