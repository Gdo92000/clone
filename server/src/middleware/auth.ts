import { verify } from "hono/jwt";
import type { MiddlewareHandler as Middleware, Context, Next } from "hono";
import type { TokenPayload } from "../auth/types";
import { JWT_SECRET } from "../config";

export const authMiddleware: Middleware = async (c: Context, next: Next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    c.status(401);
    return c.json({ error: "Não autenticado" }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = await verify(token, JWT_SECRET, "HS256");
    c.set("jwtPayload", payload);
    await next();
  } catch {
    c.status(401);
    return c.json({ error: "Não autenticado" }, 401);
  }
};

export const getTokenPayload = (c: {
  get: (key: string) => unknown;
}): TokenPayload | undefined => {
  const value = c.get("jwtPayload");
  if (typeof value === "object" && value !== null && "sub" in value) {
    return value as TokenPayload;
  }
  return undefined;
};
