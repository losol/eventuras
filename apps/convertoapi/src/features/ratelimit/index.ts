import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';

export async function registerRatelimitPlugin(fastify: FastifyInstance) {
  const rate_limit = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 5;
  fastify.register(fastifyRateLimit, {
    max: rate_limit,
    timeWindow: 1000,
  });
}
