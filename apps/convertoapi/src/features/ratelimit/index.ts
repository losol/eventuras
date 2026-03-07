import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';

export async function registerRatelimitPlugin(fastify: FastifyInstance) {
  const parsed = process.env.RATE_LIMIT_MAX !== undefined
    ? Number.parseInt(process.env.RATE_LIMIT_MAX, 10)
    : NaN;
  const rate_limit = Number.isFinite(parsed) && parsed >= 1 ? parsed : 5;
  fastify.register(fastifyRateLimit, {
    max: rate_limit,
    timeWindow: 1000,
  });
}
