import { Logger } from '@eventuras/logger';
import { config } from '../config';
import type { Request, Response, NextFunction } from 'express';

const logger = Logger.create({ namespace: 'idem:error' });

/**
 * Express error handling middleware
 * Logs full error details, returns sanitized response to client
 */
export function errorHandler(
  err: Error & { status?: number; code?: string },
  req: Request,
  res: Response,
  _next: NextFunction
) {
  // Log full error details (never sent to client)
  logger.error({
    error: err.message,
    stack: err.stack,
    code: err.code,
    status: err.status,
    method: req.method,
    path: req.path,
    query: req.query,
    ip: req.ip,
  }, 'Request error');

  // Determine status code
  const status = err.status || 500;

  // In development, include more details
  if (config.nodeEnv === 'development') {
    return res.status(status).json({
      error: err.message || 'Internal Server Error',
      code: err.code,
      stack: err.stack?.split('\n').slice(0, 5), // First 5 lines of stack
      path: req.path,
    });
  }

  // In production, return generic error
  const genericErrors: Record<number, string> = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
    502: 'Bad Gateway',
    503: 'Service Unavailable',
  };

  res.status(status).json({
    error: genericErrors[status] || 'An error occurred',
    message: status < 500 ? err.message : 'Please try again later or contact support',
  });
}

/**
 * Async route wrapper to catch errors
 * Use this to wrap async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
