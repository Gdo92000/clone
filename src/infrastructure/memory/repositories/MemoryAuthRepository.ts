/* eslint-disable @typescript-eslint/require-await */
import type { IAuthRepository } from 'src/domain/repositories/IAuthRepository';
import type { AuthUser, AuthSession } from 'src/domain/entities/User';
import { mockUsers, mockSessions } from '../data/auth';

export class MemoryAuthRepository implements IAuthRepository {
  private users = [...mockUsers];
  private sessions = [...mockSessions];

  async findMany(): Promise<AuthUser[]> {
    return this.users;
  }

  async findById(id: string): Promise<AuthUser | null> {
    const found = this.users.find(u => u.id === id);
    return found ?? null;
  }

  async findByIds(ids: string[]): Promise<AuthUser[]> {
    return this.users.filter(u => ids.includes(u.id));
  }

  async create(data: Record<string, unknown>): Promise<AuthUser> {
    const item = { id: crypto.randomUUID(), ...data } as unknown as AuthUser;
    this.users.push(item);
    return item;
  }

  async update(id: string, data: Partial<AuthUser>): Promise<AuthUser | null> {
    const found = this.users.find(u => u.id === id);
    if (!found) return null;
    Object.assign(found, data);
    return found;
  }

  async remove(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    this.users.splice(index, 1);
    return true;
  }

  async count(): Promise<number> {
    return this.users.length;
  }

  async exists(id: string): Promise<boolean> {
    return this.users.some(u => u.id === id);
  }

  async findByEmail(email: string): Promise<AuthUser | null> {
    const found = this.users.find(u => u.email === email);
    return found ?? null;
  }

  async findByRole(role: string): Promise<AuthUser[]> {
    return this.users.filter(u => u.role === role);
  }

  async createSession(userId: string): Promise<AuthSession> {
    const session: AuthSession = {
      userId,
      token: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      expiresIn: 86400,
    };
    this.sessions.push(session);
    return session;
  }

  async findSessionByToken(token: string): Promise<AuthSession | null> {
    const found = this.sessions.find(s => s.token === token);
    return found ?? null;
  }

  async revokeSession(token: string): Promise<boolean> {
    const index = this.sessions.findIndex(s => s.token === token);
    if (index === -1) return false;
    this.sessions.splice(index, 1);
    return true;
  }
}
