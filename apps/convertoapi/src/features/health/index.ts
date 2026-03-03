import { FastifyInstance } from 'fastify';
import { healthRoutes } from './healthRoutes.js';

export async function registerHealthRoutes(fastify: FastifyInstance) {
  fastify.register(healthRoutes);
}
