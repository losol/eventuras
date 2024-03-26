import { FastifyInstance } from 'fastify';
import fastifyJwt from '@fastify/jwt';
import authPlugin from './authPlugin';

export async function registerAuthPlugin(fastify: FastifyInstance) {
  // Ensure JWT_SECRET is set
  if (!process.env.JWT_SECRET) throw new Error('JWT_SECRET is required');

  // Register JWT setup plugin
  await fastify.register(fastifyJwt, { secret: process.env.JWT_SECRET });

  // Register the authentication plugin
  fastify.register(authPlugin);
}
