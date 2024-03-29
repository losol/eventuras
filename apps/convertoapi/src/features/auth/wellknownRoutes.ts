import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

const wellKnownSchema = {
  response: {
    200: {
      type: 'object',
      properties: {
        issuer: { type: 'string' },
        token_endpoint: { type: 'string' },
        token_endpoint_auth_methods_supported: {
          type: 'array',
          items: {
            type: 'string',
          },
        },
      },
    },
  },
};

const wellKnownGetHandler = async (request: FastifyRequest, reply: FastifyReply) => {
  const tokenEndpoint = new URL('/token', process.env.BASE_URL).toString();

  reply.send({
    issuer: process.env.BASE_URL,
    token_endpoint: tokenEndpoint,
    token_endpoint_auth_methods_supported: ['client_secret_post'],
  });
};

const wellKnownRoutes: FastifyPluginAsync = async fastify => {
  fastify.route({
    method: 'GET',
    url: '/.well-known/openid-configuration',
    schema: wellKnownSchema,
    handler: wellKnownGetHandler,
  });
};

export default fp(wellKnownRoutes, { name: 'wellKnownRoutes' });
