import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';

export async function registerRatelimitPlugin(fastify: FastifyInstance) {
  const env = process.env.RATE_LIMIT_MAX;
  const parsed = env != null ? Number.parseInt(env, 10) : Number.NaN;
  const rate_limit = Number.isFinite(parsed) && parsed >= 1 ? parsed : 5;
  fastify.register(fastifyRateLimit, {
    max: rate_limit,
    timeWindow: 1000,
  });
}
