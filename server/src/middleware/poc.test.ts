import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Hono } from 'hono';

vi.mock('hono/jwt', () => ({
  verify: vi.fn().mockImplementation((token: string) => {
    if (token === 'valid-token') {
      return Promise.resolve({
        sub: 'user-1',
        role: 'merchant',
        company_id: 'company-1',
        iat: Date.now(),
        exp: Date.now() + 3600,
      });
    }
    if (token === 'admin-token') {
      return Promise.resolve({
        sub: 'user-1',
        role: 'admin',
        company_id: 'company-1',
        iat: Date.now(),
        exp: Date.now() + 3600,
      });
    }
    return Promise.reject(new Error('Invalid token'));
  }),
  jwt: vi.fn(),
  decode: vi.fn(),
  sign: vi.fn(),
}));

const JWT_SECRET = 'test-secret';

describe('POC - authMiddleware + requirePermission (Estratégia A)', () => {
  let app: Hono;

  beforeEach(async () => {
    vi.clearAllMocks();

    const { authMiddleware } = await import('./auth');
    const { requirePermission } = await import('./permission');

    app = new Hono();

    app.use('/protected/*', authMiddleware);
    app.use('/admin/*', authMiddleware, requirePermission({ roles: ['admin', 'superadmin'] }));

    app.get('/protected/me', (c) => {
      return c.json({ user: c.get('jwtPayload') });
    });

    app.get('/admin/dashboard', (c) => {
      return c.json({ message: 'Admin dashboard' });
    });
  });

  it('authMiddleware - permite acesso com token válido', async () => {
    const res = await app.request('/protected/me', {
      headers: { Authorization: 'Bearer valid-token' },
    }, { JWT_SECRET });

    expect(res.status).toBe(200);
    const body = await res.json() as { user: { role: string } };
    expect(body.user).toBeDefined();
    expect(body.user.role).toBe('merchant');
  });

  it('authMiddleware - rejeita sem token', async () => {
    const res = await app.request('/protected/me', {}, { JWT_SECRET });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Não autenticado');
  });

  it('authMiddleware - rejeita token inválido', async () => {
    const res = await app.request('/protected/me', {
      headers: { Authorization: 'Bearer invalid-token' },
    }, { JWT_SECRET });

    expect(res.status).toBe(401);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Não autenticado');
  });

  it('requirePermission - permite admin com token válido', async () => {
    const res = await app.request('/admin/dashboard', {
      headers: { Authorization: 'Bearer admin-token' },
    }, { JWT_SECRET });

    expect(res.status).toBe(200);
    const body = await res.json() as { message: string };
    expect(body.message).toBe('Admin dashboard');
  });

  it('requirePermission - rejeita merchant sem role admin', async () => {
    const res = await app.request('/admin/dashboard', {
      headers: { Authorization: 'Bearer valid-token' },
    }, { JWT_SECRET });

    expect(res.status).toBe(403);
    const body = await res.json() as { error: string };
    expect(body.error).toBe('Acesso não autorizado');
  });
});
