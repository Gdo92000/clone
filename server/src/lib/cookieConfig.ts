import type { CookieOptions } from 'hono/utils/cookie';
import { NODE_ENV } from '../config';

export const REFRESH_COOKIE_NAME = 'fluxds_refresh_token';

export const REFRESH_COOKIE_OPTIONS: CookieOptions = {
  path: '/',
  httpOnly: true,
  secure: NODE_ENV === 'production',
  sameSite: 'Lax',
  maxAge: 7 * 24 * 60 * 60,
};
