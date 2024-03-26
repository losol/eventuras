import * as path from 'path';
import fastifyStatic from '@fastify/static';
import { FastifyPluginAsync } from 'fastify';

export const homepagePlugin: FastifyPluginAsync = async (fastify, opts) => {
  fastify.register(fastifyStatic, {
    root: path.join(__dirname, '..', '..', '..', 'public'),
    wildcard: false,
  });
};
