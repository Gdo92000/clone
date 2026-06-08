import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import { eq } from 'drizzle-orm';
import type { IAuthRepository } from 'src/domain/repositories/IAuthRepository';
import type { AuthUser, AuthSession } from 'src/domain/entities/User';
import { users } from 'server/src/db/schema/customer';
import { authSessions } from 'server/src/db/schema/operations';
import { fromDbRows, fromDbRow, toDbInput } from '../helpers';

export class PostgresAuthRepository implements IAuthRepository {
  constructor(private readonly _db: PostgresJsDatabase) {}

  async findMany(): Promise<AuthUser[]> {
    const rows = await this._db.select().from(users);
    return fromDbRows<AuthUser>(rows);
  }

  async findById(id: string): Promise<AuthUser | null> {
    const rows = await this._db.select().from(users).where(eq(users.id, id)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as AuthUser;
  }

  async findByIds(ids: string[]): Promise<AuthUser[]> {
    if (ids.length === 0) return [];
    const rows = await this._db.select().from(users);
    return fromDbRows<AuthUser>(rows.filter((r) => ids.includes(r.id)));
  }

  async create(data: Record<string, unknown>): Promise<AuthUser> {
    const rows = await this._db.insert(users).values(        toDbInput(data) as typeof users.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return { ...fromDbRow(row) } as AuthUser;
  }

  async update(id: string, data: Partial<AuthUser>): Promise<AuthUser | null> {
    const rows = await this._db.update(users).set(        toDbInput(data) as Partial<typeof users.$inferInsert>).where(eq(users.id, id)).returning();
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as AuthUser;
  }

  async remove(id: string): Promise<boolean> {
    await this._db.delete(users).where(eq(users.id, id));
    return true;
  }

  async count(): Promise<number> {
    const rows = await this._db.select().from(users);
    return rows.length;
  }

  async exists(id: string): Promise<boolean> {
    const row = await this.findById(id);
    return row !== null;
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const rows = await this._db.select().from(users).where(eq(users.email, email)).limit(1);
    if (!rows[0]) return null;
    return { ...fromDbRow(rows[0]) } as AuthUser;
  }

  async findByRole(role: string): Promise<AuthUser[]> {
    const typedRole = role as 'customer' | 'merchant' | 'courier' | 'admin' | 'superadmin';
    const rows = await this._db.select().from(users).where(eq(users.role, typedRole));
    return fromDbRows<AuthUser>(rows);
  }

  async createSession(userId: string): Promise<AuthSession> {
    const rows = await this._db.insert(authSessions).values(toDbInput({
      user_id: userId,
      id: crypto.randomUUID(),
      refresh_token_hash: '',
      expires_at: new Date(Date.now() + 86400 * 1000),
      }) as typeof authSessions.$inferInsert).returning();
    const row = rows[0];
    if (!row) throw new Error('Expected row after insert');
    return {
      userId: row.user_id,
      token: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      expiresIn: 86400,
    };
  }

  async findSessionByToken(token: string): Promise<AuthSession | null> {
    const rows = await this._db.select().from(authSessions).where(eq(authSessions.id, token)).limit(1);
    if (!rows[0]) return null;
    return { userId: rows[0].user_id, token, refreshToken: '', expiresIn: 0 };
  }

  async revokeSession(token: string): Promise<boolean> {
    await this._db.delete(authSessions).where(eq(authSessions.id, token));
    return true;
  }
}
