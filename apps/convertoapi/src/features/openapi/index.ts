// src/swaggerPlugin/index.ts
import { FastifyInstance } from 'fastify';
import Swagger from '@fastify/swagger';
import { swaggerOptions } from './swaggerOptions.js';
import fastifyApiReference from '@scalar/fastify-api-reference';

export async function registerOpenapiPlugin(fastify: FastifyInstance) {
  fastify.register(Swagger, swaggerOptions);
  await fastify.register(fastifyApiReference, {
    routePrefix: '/openapi',
  });
}
