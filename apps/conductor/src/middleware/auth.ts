import { Request, Response, NextFunction } from 'express';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { TenantsConfig } from '../config/schemas.js';

const CONFIG_DIR = join(process.cwd(), 'data', 'config');
const TENANTS_FILE = join(CONFIG_DIR, 'tenants.json');

/**
 * Load tenants configuration
 */
function loadTenants(): TenantsConfig {
  if (!existsSync(TENANTS_FILE)) {
    return [];
  }
  try {
    return JSON.parse(readFileSync(TENANTS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

/**
 * Authentication middleware
 * Validates API key against tenant configuration
 * Future: will support JWT tokens, OAuth, etc.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Skip auth for health check endpoint
  if (req.path === '/') {
    return next();
  }

  // Check for API key in Authorization header
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: 'Missing authorization header' });
  }

  // Support both "Bearer <key>" and direct key
  const providedKey = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7)
    : authHeader;

  // Load tenants and validate API key
  const tenants = loadTenants();

  if (tenants.length === 0) {
    return res
      .status(500)
      .json({ error: 'Server configuration error: No tenants configured' });
  }

  // Find tenant by matching API key
  let authenticatedTenant = null;
  for (const tenant of tenants) {
    const tenantApiKey = process.env[tenant.authKeyEnvVar];
    if (tenantApiKey && providedKey === tenantApiKey) {
      authenticatedTenant = tenant;
      break;
    }
  }

  if (!authenticatedTenant) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Attach authenticated tenant to request
  req.tenantId = authenticatedTenant.id;
  req.tenantName = authenticatedTenant.name;

  // Authentication successful
  next();
};
