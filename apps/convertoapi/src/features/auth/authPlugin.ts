// authService.js
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (clientId: string, clientSecret: string) => Promise<string>;
    verifyJWT: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

const authPlugin: FastifyPluginAsync = async (fastify: FastifyInstance) => {
  // Add a method to verify a JWT token to be used as a preHandler in routes
  fastify.decorate('verifyJWT', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.status(401).send({ error: 'Authentication failed' });
      throw new Error('Authentication failed');
    }
  });

  // Autenticate a client and return a JWT token
  fastify.decorate('authenticate', async (clientId: string, clientSecret: string) => {
    const isValid = await validateClientCredentials(clientId, clientSecret);
    if (!isValid) throw new Error('Invalid client credentials');

    return fastify.jwt.sign({ client_id: clientId }, { expiresIn: '365d' });
  });

  // Check if the client credentials are same as in env variables
  async function validateClientCredentials(clientId: string, clientSecret: string) {
    return clientId === process.env.CLIENT_ID && clientSecret === process.env.CLIENT_SECRET;
  }
};

export default fp(authPlugin, { name: 'authPlugin' });
