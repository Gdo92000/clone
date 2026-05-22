import type { Context } from 'hono';

/**
 * Extract tenant ID from JWT payload
 * In this system, tenant is represented by company_id for merchants
 * and can be derived from user's company association
 */
export function getTenantId(c: Context): string | null {
  const payload = c.get('jwtPayload');
  if (!payload || typeof payload !== 'object') return null;
  
  // For now, we use company_id as tenant identifier
  // This assumes JWT payload contains company_id when relevant
  if ('company_id' in payload && payload.company_id) {
    return String(payload.company_id);
  }
  
  return null;
}

/**
 * Validate that tenant has access to a specific resource
 * This is a simplified check - in practice would be more sophisticated
 */
export function validateTenantAccess(
  c: Context,
  resourceCompanyId: string | null | undefined
): boolean {
  const tenantId = getTenantId(c);
  
  // Superadmin can access everything
  const payload = c.get('jwtPayload');
  if (payload && typeof payload === 'object' && 'role' in payload) {
    if (payload.role === 'superadmin') return true;
    if (payload.role === 'admin') return true; // Admins can access their company's resources
  }
  
  // If no tenant context, deny access (secure by default)
  if (!tenantId) return false;
  
  // If resource has no company association, allow (public resources)
  if (!resourceCompanyId) return true;
  
  // Check if tenant owns the resource
  return tenantId === resourceCompanyId;
}

/**
 * Middleware to enforce tenant isolation on routes
 */
export function tenantIsolationMiddleware() {
  return async (c, next) => {
    // Skip tenant validation for public routes
    const path = c.req.path;
    if (path.startsWith('/api/auth/') || 
        path.startsWith('/api/health/') ||
        path.startsWith('/api/metrics')) {
      await next();
      return;
    }
    
    const tenantId = getTenantId(c);
    if (!tenantId) {
      c.status(401);
      return c.json({ error: 'Tenant context required' });
    }
    
    // Store tenantId in context for use in handlers
    c.set('tenantId', tenantId);
    await next();
  };
}