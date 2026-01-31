import type { FastifyInstance, FastifyError, FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from '@eventuras/logger';
import { config } from '../config';

const logger = Logger.create({ namespace: 'idem:error' });

/**
 * Register Fastify error handler
 * Logs full error details, returns sanitized response to client
 */
export function registerErrorHandler(fastify: FastifyInstance) {
  fastify.setErrorHandler((
    error: FastifyError & { status?: number },
    request: FastifyRequest,
    reply: FastifyReply
  ) => {
    // Log full error details (never sent to client)
    logger.error({
      error: error.message,
      stack: error.stack,
      code: error.code,
      statusCode: error.statusCode,
      status: error.status,
      method: request.method,
      url: request.url,
      ip: request.ip,
    }, 'Request error');

    // Determine status code
    const statusCode = error.statusCode || error.status || 500;

    // In development, include more details
    if (config.nodeEnv === 'development') {
      return reply.code(statusCode).send({
        error: error.message || 'Internal Server Error',
        code: error.code,
        stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack
        url: request.url,
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

    return reply.code(statusCode).send({
      error: genericErrors[statusCode] || 'An error occurred',
      message: statusCode < 500 ? error.message : 'Please try again later or contact support',
    });
  });
}
