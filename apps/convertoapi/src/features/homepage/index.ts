import { FastifyInstance } from 'fastify';
import {homepagePlugin} from './homepagePlugin';

export async function registerHomepagePlugin(fastify: FastifyInstance) {
  fastify.register(homepagePlugin);
}
