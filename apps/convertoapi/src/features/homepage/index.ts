import { FastifyInstance } from 'fastify';
import { homepagePlugin } from './homepagePlugin.js';

export async function registerHomepagePlugin(fastify: FastifyInstance) {
  fastify.register(homepagePlugin);
}
