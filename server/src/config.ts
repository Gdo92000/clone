function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET não definido. Configure a variável de ambiente JWT_SECRET.');
    }
    console.warn('⚠ JWT_SECRET não definido. Usando fallback inseguro apenas para desenvolvimento.');
    return 'dev-secret-change-in-production';
  }
  return secret;
}

function getAllowedOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS;
  if (!raw) {
    return ['http://localhost:5173', 'http://localhost:3001'];
  }
  return raw.split(',').map((s) => s.trim()).filter(Boolean);
}

export const JWT_SECRET = getJwtSecret();
export const ALLOWED_ORIGINS = getAllowedOrigins();
