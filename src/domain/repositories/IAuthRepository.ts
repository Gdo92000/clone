import type { AuthUser, AuthSession } from 'src/domain/entities/User';
import type { RepositoryPort } from './RepositoryPort';

export interface IAuthRepository extends RepositoryPort<AuthUser> {
  findByEmail(email: string): Promise<AuthUser | null>;
  findByRole(role: string): Promise<AuthUser[]>;

  // Sessions
  createSession(userId: string): Promise<AuthSession>;
  findSessionByToken(token: string): Promise<AuthSession | null>;
  revokeSession(token: string): Promise<boolean>;
}
