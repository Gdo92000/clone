import type { IAuthRepository } from 'src/domain/repositories/IAuthRepository';
import type { AuthUser, AuthSession } from 'src/domain/entities/User';

export class AuthService {
  constructor(private readonly authRepo: IAuthRepository) {}

  async login(email: string, _password: string): Promise<{ user: AuthUser; session: AuthSession } | null> {
    const user = await this.authRepo.findByEmail(email);
    if (!user) return null;
    const session = await this.authRepo.createSession(user.id);
    return { user, session };
  }

  async getUser(id: string): Promise<AuthUser | null> {
    return this.authRepo.findById(id);
  }

  async listUsersByRole(role: string): Promise<AuthUser[]> {
    return this.authRepo.findByRole(role);
  }

  async validateSession(token: string): Promise<AuthSession | null> {
    return this.authRepo.findSessionByToken(token);
  }

  async logout(token: string): Promise<boolean> {
    return this.authRepo.revokeSession(token);
  }
}
