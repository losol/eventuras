import { Request, Response, NextFunction } from 'express';

// Extend Express Request type to include tenant context
declare global {
  namespace Express {
    interface Request {
      tenantId?: string;
      tenantName?: string;
    }
  }
}

/**
 * Tenant context middleware
 * Tenant is now set by the auth middleware based on the API key
 * This middleware is kept for backward compatibility and potential future extensions
 */
export const tenantMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Tenant ID should already be set by auth middleware
  // If not set (e.g., for health check), use a default
  if (!req.tenantId) {
    req.tenantId = 'default';
  }

  next();
};
