import { FastifyInstance } from 'fastify';
import fastifyRateLimit from '@fastify/rate-limit';

export async function registerRatelimitPlugin(fastify: FastifyInstance) {
  fastify.register(fastifyRateLimit, {
    // 5 pr second
    max: 5,
    timeWindow: 1000,
  });
}
