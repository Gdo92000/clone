import type { MiddlewareHandler } from 'hono';

export interface TokenPayload {
  sub: string;
  email: string;
  role: string;
  session_id?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface AuthUserDTO {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar_url: string;
  active: boolean;
  company_id?: string | null;
  branch_id?: string | null;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface LoginResult {
  user: AuthUserDTO;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshResult {
  accessToken: string;
  expiresIn: number;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role?: string;
}

export interface AuthProvider {
  readonly name: string;

  hashPassword(password: string): Promise<string>;
  verifyPassword(password: string, hash: string): Promise<boolean>;

  generateTokens(payload: TokenPayload): Promise<AuthTokens>;
  verifyToken(token: string): Promise<TokenPayload>;
  verifyRefreshToken(refreshToken: string): Promise<TokenPayload>;

  middleware(): MiddlewareHandler;

  login(input: LoginInput, deviceInfo?: { ip?: string; userAgent?: string }): Promise<LoginResult>;
  refresh(refreshToken: string): Promise<RefreshResult>;
  logout(sessionId: string): Promise<void>;
  getCurrentUser(userId: string): Promise<AuthUserDTO>;
}
