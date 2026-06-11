import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { securityHeaders } from './securityHeaders';

describe('securityHeaders middleware', () => {
  it('sets all security headers', async () => {
    const app = new Hono();
    app.use(securityHeaders);
    app.get('/test', (c) => c.text('ok'));

    const res = await app.request('/test');
    expect(res.status).toBe(200);
    expect(res.headers.get('X-Content-Type-Options')).toBe('nosniff');
    expect(res.headers.get('X-Frame-Options')).toBe('DENY');
    expect(res.headers.get('X-XSS-Protection')).toBe('0');
    expect(res.headers.get('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(res.headers.get('X-Permitted-Cross-Domain-Policies')).toBe('none');
    expect(res.headers.get('Strict-Transport-Security')).toBe('max-age=31536000; includeSubDomains');
    expect(res.headers.get('Permissions-Policy')).toBe('camera=(), microphone=(), payment=()');
    expect(res.headers.get('Content-Security-Policy')).toContain("default-src 'self'");
  });
});
