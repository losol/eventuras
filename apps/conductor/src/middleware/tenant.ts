import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
    }
  }
}

/**
 * Tenant context middleware
 * For now: uses TENANT_ID from environment
 * Future: will extract tenant from JWT token, subdomain, or header
 */
export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // For now, use the tenant ID from environment
  const tenantId = process.env.TENANT_ID || 'default';
  
  // Attach tenant context to request
  req.tenantId = tenantId;
  
  // Future: could validate tenant exists in database here
  // Future: could load tenant-specific configuration
  
  next();
};
