import type { AuthProvider, AuthProviderType } from './types';
import { localAuthProvider } from './local/provider';

const PROVIDER_ENV_KEY = 'AUTH_PROVIDER';

const providers: Record<AuthProviderType, AuthProvider> = {
  local: localAuthProvider,
};

export function getAuthProvider(): AuthProvider {
  const raw = process.env[PROVIDER_ENV_KEY] ?? 'local';
  const type: AuthProviderType = raw === 'supabase' ? 'supabase' : 'local';
  const provider = providers[type];
  if (!provider) {
    throw new Error(`Auth provider "${type}" não implementado`);
  }
  return provider;
}

export { localAuthProvider } from './local/provider';
export type { AuthProvider, TokenPayload, AuthTokens, LoginInput, LoginResult, AuthUserDTO, AuthProviderType } from './types';
