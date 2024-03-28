import * as path from 'path';
import fastifyStatic from '@fastify/static';
import { FastifyInstance } from 'fastify';

export const homepagePlugin = async (fastify: FastifyInstance) => {
  fastify.register(fastifyStatic, {
    root: process.env.PUBLIC_PATH ? process.env.PUBLIC_PATH : path.join(process.cwd(), 'public'),
    wildcard: false,
  });
};
