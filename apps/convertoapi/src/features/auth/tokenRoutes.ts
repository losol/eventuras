import { FastifyInstance, FastifyPluginAsync, FastifyRequest, FastifyReply } from 'fastify';
import fp from 'fastify-plugin';
import { Buffer } from 'buffer';

const tokenRoutes: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  const tokenSchema = {
    description:
      'OAuth 2.0 Token Endpoint (Client Credentials Grant). Requires Basic Authentication.',
    headers: {
      type: 'object',
      required: ['authorization'],
      properties: {
        authorization: {
          type: 'string',
          description: 'Basic authentication header with client_id:client_secret in Base64',
          pattern: '^Basic [A-Za-z0-9+/=]+$',
        },
      },
    },
    body: {
      type: 'object',
      required: ['grant_type'],
      properties: {
        grant_type: { type: 'string', enum: ['client_credentials'] },
      },
    },
    response: {
      200: {
        description: 'Successful token response',
        type: 'object',
        properties: {
          access_token: { type: 'string', description: 'JWT access token' },
          token_type: { type: 'string', default: 'Bearer' },
          expires_in: { type: 'integer', default: 3600 },
        },
        required: ['access_token'],
      },
      400: {
        description: 'Bad request',
        type: 'object',
        properties: {
          error: { type: 'string', default: 'invalid_request' },
          message: { type: 'string' },
        },
      },
      401: {
        description: 'Unauthorized - Invalid credentials',
        type: 'object',
        properties: {
          error: { type: 'string', default: 'invalid_client' },
          message: { type: 'string' },
        },
      },
      500: {
        description: 'Internal server error',
        type: 'object',
        properties: {
          error: { type: 'string', default: 'server_error' },
          message: { type: 'string' },
        },
      },
    },
  };

  const tokenPostHandler = async (
    request: FastifyRequest<{ Body: { grant_type: string } }>,
    reply: FastifyReply
  ) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Basic ')) {
        return reply.status(401).send({
          error: 'invalid_client',
          error_description: 'Client credentials must be provided in Authorization header',
        });
      }

      const base64Credentials = authHeader?.split(' ')[1];
      if (!base64Credentials) {
        return reply.status(401).send({
          error: 'invalid_client',
          error_description: 'Malformed authorization header',
        });
      }

      const decoded = Buffer.from(base64Credentials, 'base64').toString('utf-8');
      const [client_id, client_secret] = decoded.split(':');

      if (!client_id || !client_secret) {
        return reply.status(401).send({
          error: 'invalid_client',
          error_description: 'Invalid client credentials format',
        });
      }

      const token = await fastify.authenticate(client_id, client_secret);

      reply.send({
        access_token: token,
        token_type: 'Bearer',
        expires_in: 3600,
      });
    } catch (error) {
      reply.status(401).send({
        error: 'invalid_client',
        error_description: 'Client authentication failed',
      });
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
