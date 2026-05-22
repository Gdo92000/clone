import crypto from 'node:crypto';
import { sign, verify , jwt } from 'hono/jwt';
import { and, isNull, eq, sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import { db } from '../../db';
import { users, authSessions } from '../../db/schema';
import { JWT_SECRET } from '../../config';
import { createAuditLog } from '../../services/auditLogService';
import { recordFailedAttempt, isLockedOut, getRemainingLockoutSeconds, clearAttempts } from '../../services/loginLockout';
import type { AuthProvider, TokenPayload, AuthTokens, LoginInput, LoginResult, RefreshResult, AuthUserDTO } from '../types';

const ACCESS_TOKEN_TTL = 60 * 15;
const REFRESH_TOKEN_TTL = 60 * 60 * 24 * 7;
const SESSION_TTL_MS = REFRESH_TOKEN_TTL * 1000;

function nowUnix(): number {
  return Math.floor(Date.now() / 1000);
}

function sha256(s: string): string {
  return crypto.createHash('sha256').update(s, 'utf8').digest('hex');
}

function userToDTO(row: typeof users.$inferSelect): AuthUserDTO {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    role: row.role,
    avatar_url: row.avatar_url ?? '',
    active: row.is_active ?? true,
    company_id: row.company_id,
    branch_id: row.branch_id,
  };
}

export const localAuthProvider: AuthProvider = {
  name: 'local',

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  },

   async generateTokens(payload: TokenPayload): Promise<AuthTokens> {
     const now = nowUnix();
     // Ensure company_id is included in JWT payload for tenant context
     const tokenPayload = {
       ...payload,
       company_id: payload.company_id ?? null
     };
     const accessToken = await sign(
       { ...tokenPayload, exp: now + ACCESS_TOKEN_TTL, iat: now },
       JWT_SECRET,
     );
     return { accessToken, refreshToken: '', expiresIn: ACCESS_TOKEN_TTL };
   },

  async verifyToken(token: string): Promise<TokenPayload> {
    const result = await verify(token, JWT_SECRET, 'HS256');
    return result as unknown as TokenPayload;
  },

  async verifyRefreshToken(refreshTokenRaw: string): Promise<TokenPayload> {
    const lookup = sha256(refreshTokenRaw);
    const sessions = await db.select()
      .from(authSessions)
      .where(and(eq(authSessions.token_lookup, lookup), isNull(authSessions.revoked_at)))
      .limit(1);

    if (!sessions.length) throw new Error('Token inválido');

    const session = sessions[0];
    if (new Date(session.expires_at) < new Date()) {
      await db.update(authSessions).set({ revoked_at: new Date() }).where(eq(authSessions.id, session.id));
      throw new Error('Sessão expirada');
    }

    const match = await bcrypt.compare(refreshTokenRaw, session.refresh_token_hash);
    if (!match) throw new Error('Token inválido');

     const user = await db.select().from(users).where(eq(users.id, session.user_id)).limit(1);
     if (!user.length) throw new Error('Usuário não encontrado');

     await db.update(authSessions).set({ last_used_at: sql`now()` }).where(eq(authSessions.id, session.id));
     return { 
       sub: user[0].id, 
       email: user[0].email, 
       role: user[0].role, 
       session_id: session.id,
       company_id: user[0].company_id,
     };
  },

  middleware() {
    return jwt({ secret: JWT_SECRET, alg: 'HS256' });
  },

  async login(input: LoginInput, deviceInfo?: { ip?: string; userAgent?: string }): Promise<LoginResult> {
    const ip = deviceInfo?.ip;
    if (isLockedOut(input.email, ip)) {
      const retryAfter = getRemainingLockoutSeconds(input.email, ip);
      throw Object.assign(new Error(`Conta bloqueada temporariamente. Tente novamente em ${retryAfter} segundos.`), { retryAfter });
    }

    const rows = await db.select().from(users).where(eq(users.email, input.email)).limit(1);
    if (!rows.length) {
      recordFailedAttempt(input.email, ip);
      await createAuditLog({ action: 'LOGIN_FAILED', metadata: { email: input.email }, ipAddress: deviceInfo?.ip, userAgent: deviceInfo?.userAgent });
      throw new Error('Usuário ou senha inválidos');
    }

    const user = rows[0];
    if (!user.password_hash) {
      recordFailedAttempt(input.email, ip);
      throw new Error('Usuário ou senha inválidos');
    }

    const passwordMatch = await bcrypt.compare(input.password, user.password_hash);
    if (!passwordMatch) {
      recordFailedAttempt(input.email, ip);
      await createAuditLog({ userId: user.id, action: 'LOGIN_FAILED', ipAddress: deviceInfo?.ip, userAgent: deviceInfo?.userAgent });
      throw new Error('Usuário ou senha inválidos');
    }

    clearAttempts(input.email, ip);

    const sessionId = crypto.randomUUID();
    const refreshTokenRaw = crypto.randomUUID();

    const payload: TokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      session_id: sessionId,
    };

    // Ensure company_id is included in payload for token generation
    const tokenPayload = {
      ...payload,
      company_id: payload.company_id ?? null
    };
    const tokens = await localAuthProvider.generateTokens(tokenPayload);

    const refreshTokenHash = await bcrypt.hash(refreshTokenRaw, 6);
    await db.insert(authSessions).values({
      id: sessionId,
      user_id: user.id,
      refresh_token_hash: refreshTokenHash,
      token_lookup: sha256(refreshTokenRaw),
      device_info: deviceInfo?.userAgent ?? null,
      ip_address: deviceInfo?.ip ?? null,
      expires_at: new Date(Date.now() + SESSION_TTL_MS),
    });

    await createAuditLog({ userId: user.id, action: 'LOGIN_SUCCESS', ipAddress: deviceInfo?.ip, userAgent: deviceInfo?.userAgent });

    return {
      user: userToDTO(user),
      token: tokens.accessToken,
      refreshToken: refreshTokenRaw,
      expiresIn: tokens.expiresIn,
    };
  },

  async refresh(refreshTokenRaw: string): Promise<RefreshResult> {
    const payload = await localAuthProvider.verifyRefreshToken(refreshTokenRaw);

    const now = nowUnix();
    const newPayload: TokenPayload = { sub: payload.sub, email: payload.email, role: payload.role, session_id: payload.session_id };
    const accessToken = await sign(
      { ...newPayload, exp: now + ACCESS_TOKEN_TTL, iat: now },
      JWT_SECRET,
    );

    await createAuditLog({ userId: payload.sub, action: 'TOKEN_REFRESH' });

    return { accessToken, expiresIn: ACCESS_TOKEN_TTL };
  },

  async logout(sessionId: string): Promise<void> {
    await db.update(authSessions)
      .set({ revoked_at: new Date() })
      .where(and(eq(authSessions.id, sessionId), isNull(authSessions.revoked_at)));

    const session = await db.select().from(authSessions).where(eq(authSessions.id, sessionId)).limit(1);
    if (session.length) {
      await createAuditLog({ userId: session[0].user_id, action: 'LOGOUT' });
    }
  },

  async getCurrentUser(userId: string): Promise<AuthUserDTO> {
    const rows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (!rows.length) throw new Error('Usuário não encontrado');
    return userToDTO(rows[0]);
  },
};
