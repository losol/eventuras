// authService.js
import { FastifyInstance, FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import TokenRequest from './TokenRequest';

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

  // Route to get a JWT token
  fastify.post('/token', async (request, reply) => {
    try {
      const { client_id, client_secret, grant_type } = request.body as TokenRequest;

      // Only client_credentials grant type is supported for now/for ever
      if (grant_type !== 'client_credentials') {
        reply.status(400).send({ error: 'Invalid grant type' });
        return;
      }

      const token = await fastify.authenticate(client_id, client_secret);

      reply.send({ access_token: token, token_type: 'Bearer', expires_in: 3600 });
    } catch (error) {
      if (error instanceof Error) {
        reply.status(401).send({ error: error.message });
      } else {
        reply.status(500).send({ error: 'An unknown error occurred' });
      }
    }
  });

  // Hjelpefunksjon for å validere klient-credentials
  async function validateClientCredentials(clientId: string, clientSecret: string) {
    return clientId === process.env.CLIENT_ID && clientSecret === process.env.CLIENT_SECRET;
  }
};

export default fp(authPlugin, { name: 'authPlugin' });
