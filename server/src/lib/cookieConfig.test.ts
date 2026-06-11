import { describe, it, expect } from 'vitest';

describe('cookieConfig', () => {
  it('exports REFRESH_COOKIE_NAME', async () => {
    const { REFRESH_COOKIE_NAME } = await import('./cookieConfig');
    expect(REFRESH_COOKIE_NAME).toBe('fluxds_refresh_token');
  });

  it('exports REFRESH_COOKIE_OPTIONS with correct defaults', async () => {
    const { REFRESH_COOKIE_OPTIONS } = await import('./cookieConfig');
    expect(REFRESH_COOKIE_OPTIONS).toEqual({
      path: '/',
      httpOnly: true,
      secure: false,
      sameSite: 'Lax',
      maxAge: 7 * 24 * 60 * 60,
    });
  });
});