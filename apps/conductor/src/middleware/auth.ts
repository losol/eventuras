import { Request, Response, NextFunction } from 'express';

/**
 * Authentication middleware
 * For now: validates against API_KEY from environment
 * Future: will support JWT tokens, OAuth, etc.
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Skip auth for health check endpoint
  if (req.path === '/') {
    return next();
  }

  const apiKey = process.env.API_KEY;
  
  // Require API_KEY to be set
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error: API_KEY not set' });
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

  if (providedKey !== apiKey) {
    return res.status(403).json({ error: 'Invalid API key' });
  }

  // Authentication successful
  next();
};
