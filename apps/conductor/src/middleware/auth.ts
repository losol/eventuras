import { Request, Response, NextFunction } from 'express';
import { readFileSync, existsSync, watchFile } from 'fs';
import { join } from 'path';
import { timingSafeEqual } from 'crypto';
import type { TenantsConfig } from '../config/schemas.js';

const CONFIG_DIR = join(process.cwd(), 'data', 'config');
const TENANTS_FILE = join(CONFIG_DIR, 'tenants.json');

// Cached tenants configuration
let cachedTenants: TenantsConfig | null = null;

/**
 * Load tenants configuration from disk
 */
function loadTenantsFromDisk(): TenantsConfig {
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
 * Get tenants configuration (cached)
 */
function getTenants(): TenantsConfig {
  if (cachedTenants === null) {
    cachedTenants = loadTenantsFromDisk();

    // Watch for file changes and reload cache
    watchFile(TENANTS_FILE, { interval: 5000 }, () => {
      cachedTenants = loadTenantsFromDisk();
    });
  }
  return cachedTenants;
}

/**
 * Constant-time string comparison to prevent timing attacks
 */
function constantTimeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, 'utf-8');
    const bufB = Buffer.from(b, 'utf-8');

    // If lengths differ, still compare to avoid timing leak
    if (bufA.length !== bufB.length) {
      return false;
    }

    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
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

  // Get cached tenants
  const tenants = getTenants();

  if (tenants.length === 0) {
    return res
      .status(500)
      .json({ error: 'Server configuration error: No tenants configured' });
  }

  // Find tenant by matching API key using constant-time comparison
  let authenticatedTenant = null;
  for (const tenant of tenants) {
    const tenantApiKey = process.env[tenant.authKeyEnvVar];
    if (tenantApiKey && constantTimeCompare(providedKey, tenantApiKey)) {
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
