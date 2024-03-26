// src/swaggerPlugin/index.ts
import { FastifyInstance } from 'fastify';
import Swagger from '@fastify/swagger';
import { swaggerOptions } from './swaggerOptions';

export async function registerOpenapiPlugin(fastify: FastifyInstance) {
  fastify.register(Swagger, swaggerOptions);
  await fastify.register(require('@scalar/fastify-api-reference'), {
  routePrefix: '/openapi',
  })
}
