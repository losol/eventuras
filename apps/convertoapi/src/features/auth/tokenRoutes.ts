import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';

interface TokenRequest {
  grant_type: string;
  client_id: string;
  client_secret: string;
}

const tokenRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const tokenSchema = {
    body: {
      type: 'object',
      required: ['client_id', 'client_secret', 'grant_type'],
      properties: {
        client_id: { type: 'string' },
        client_secret: { type: 'string' },
        grant_type: { type: 'string', enum: ['client_credentials'] },
      },
    },
    response: {
      200: {
        type: 'object',
        properties: {
          access_token: { type: 'string' },
          token_type: { type: 'string', default: 'Bearer' },
          expires_in: { type: 'number' },
        },
      },
      401: {
        type: 'object',
        properties: {
          error: { type: 'string' },
        },
      },
    },
  };

  const tokenPostHandler = async (
    request: FastifyRequest<{ Body: TokenRequest }>,
    reply: FastifyReply
  ) => {
    try {
      const token = await fastify.authenticate(request.body.client_id, request.body.client_secret);

      reply.send({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(401).send({ error: error.message });
      } else {
        reply.status(500).send({ error: 'An unknown error occurred' });
      }
    }
  };

  fastify.route({
    method: 'POST',
    url: '/token',
    schema: tokenSchema,
    handler: tokenPostHandler,
  });
};

export default fp(tokenRoutes, { name: 'tokenRoute' });
