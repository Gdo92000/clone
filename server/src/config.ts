function getJwtSecretFromEnv(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET não definido. Configure a variável de ambiente JWT_SECRET.');
  }
  return secret;
}

export function getJwtSecret(): string {
  return getJwtSecretFromEnv();
}

const _jwtSecret = getJwtSecretFromEnv();
export const JWT_SECRET = _jwtSecret;

function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return ['http://localhost:5173', 'https://localhost:5173', 'http://localhost:3000', 'https://localhost:3000', 'http://localhost:3001'];
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

function getAuthProviderType(): string {
  return process.env.AUTH_PROVIDER ?? 'local';
}

export const ALLOWED_ORIGINS = getAllowedOrigins();
export const AUTH_PROVIDER_TYPE = getAuthProviderType();
export const REDIS_URL = process.env.REDIS_URL ?? '';
