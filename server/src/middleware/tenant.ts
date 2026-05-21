import type { MiddlewareHandler } from 'hono';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { users, branches } from '../db/schema';
import { getTokenPayload } from './auth';
 
export function requireTenantOwnership(paramName: 'branchId' | 'companyId' = 'branchId'): MiddlewareHandler {
  return async (c, next) => {
    const payload = getTokenPayload(c);
    if (!payload) return c.json({ error: 'Não autenticado' }, 401);
 
    if (payload.role === 'superadmin') {
      await next(); return;
    }
 
    const user = await db.select({
      company_id: users.company_id,
      branch_id: users.branch_id,
      role: users.role,
    }).from(users).where(eq(users.id, payload.sub)).limit(1);
 
    if (!user.length) {
      return c.json({ error: 'Usuário não encontrado no banco de dados' }, 404);
    }
 
    const userData = user[0];
    const requestedId = c.req.param(paramName);
    const queryId = paramName === 'branchId' ? c.req.query('branch_id') : c.req.query('company_id');
    const id = requestedId || queryId;
 
    if (!id) {
      // If no ID is provided, the route should handle filtering by user's own company/branch
      // We attach the user's identifiers to the context for the route to use
      c.set('userCompanyId', userData.company_id);
      c.set('userBranchId', userData.branch_id);
      await next(); return;
    }
 
    if (paramName === 'branchId') {
      if (userData.role === 'admin') {
        const branch = await db.select({ company_id: branches.company_id })
          .from(branches)
          .where(eq(branches.id, id))
          .limit(1);
        if (!branch.length || branch[0].company_id !== userData.company_id) {
          return c.json({ error: 'Acesso negado a esta filial' }, 403);
        }
      } else if (userData.role === 'merchant') {
        if (id !== userData.branch_id) {
          return c.json({ error: 'Acesso negado a esta filial' }, 403);
        }
      } else {
        return c.json({ error: 'Permissão insuficiente para acessar filiais' }, 403);
      }
    } else {
      if (userData.role === 'admin' || userData.role === 'merchant') {
        if (id !== userData.company_id) {
          return c.json({ error: 'Acesso negado a esta empresa' }, 403);
        }
      } else {
        return c.json({ error: 'Permissão insuficiente para acessar empresas' }, 403);
      }
    }
 
    c.set('userCompanyId', userData.company_id);
    c.set('userBranchId', userData.branch_id);
    await next();
  };
}
