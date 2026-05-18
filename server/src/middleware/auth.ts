import { jwt } from 'hono/jwt';
import type { MiddlewareHandler } from 'hono';
import { JWT_SECRET } from '../config';

export const authMiddleware: MiddlewareHandler = jwt({ secret: JWT_SECRET, alg: 'HS256' });
